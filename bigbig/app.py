# app.py
from flask import Flask, request, jsonify, session, g
from models import db, User
from flask_cors import CORS # 导入 CORS

app = Flask(__name__)

# 配置数据库 (使用SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bridge_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Session密钥
app.config['SECRET_KEY'] = 'a_very_simple_secret_key' 

# ===================================================
# ⭐️ 修改配置：显式设置 Session Cookie 属性
# 解决跨域(CORS)请求中浏览器阻止 Session Cookie 传输的问题
# 'Lax' 在大部分现代浏览器中是本地开发的良好选择。
# ===================================================
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 
app.config['SESSION_COOKIE_SECURE'] = False # 本地开发时使用 HTTP (非 HTTPS) 必须设置为 False
# ===================================================

db.init_app(app)

# 允许跨域请求，使其能与前端 (如 Live Server 5500 端口) 通信
CORS(app, supports_credentials=True) 

# 确保在第一次请求前创建数据库和表
with app.app_context():
    db.create_all()
    # 确保有一个管理员用户 (如果不存在)
    if not User.query.filter_by(username='admin').first():
        admin_user = User(username='admin', password='123', role='admin')
        db.session.add(admin_user)
        db.session.commit()
        print("已创建默认管理员用户: admin/123")


# --- 认证和权限中间件 ---

@app.before_request
def load_user():
    """在每个请求前检查session中是否有用户ID"""
    user_id = session.get('user_id')
    if user_id is not None:
        g.user = User.query.get(user_id)
    else:
        g.user = None

def require_admin(f):
    """装饰器：要求用户具有管理员权限"""
    def decorated_function(*args, **kwargs):
        if not g.user or g.user.role != 'admin':
            return jsonify({'message': '权限不足'}), 403
        return f(*args, **kwargs)
    return decorated_function


# ------------------------------------
# 路由 1: 用户注册 /api/auth/register
# ------------------------------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '请提供用户名和密码'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': '用户名已被注册'}), 400

    # 创建新用户 (密码为明文存储)
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(new_user.serialize), 201


# ------------------------------------
# 路由 2: 用户登录 /api/auth/login
# ------------------------------------
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    # 验证用户名和明文密码
    if user and user.password == password:
        # 将用户ID存储在Session中 (登录状态)，Session Cookie 会随响应发送给浏览器
        session['user_id'] = user.id 
        return jsonify(user.serialize)
    else:
        return jsonify({'message': '无效的用户名或密码'}), 401

# ------------------------------------
# 路由 3: 用户登出 /api/auth/logout
# ------------------------------------
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': '登出成功'})


# ------------------------------------
# 路由 4: 排行榜 /api/leaderboard
# ------------------------------------
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    # 按积分降序排序
    users = User.query.order_by(User.score.desc()).all()
    
    # 返回只包含必要数据的列表
    leaderboard_data = []
    for user in users:
        leaderboard_data.append({
            'id': user.username,
            'win': user.wins,
            'draw': user.draws,
            'loss': user.losses,
            'score': user.score
        })
        
    return jsonify(leaderboard_data)

# ------------------------------------
# 路由 5: 管理员记录 (仅管理员可访问) /api/admin/records
# ------------------------------------
@app.route('/api/admin/records', methods=['GET'])
@require_admin
def admin_records():
    # 模拟返回一些记录数据
    mock_records = [
        {'id': 1, 'username': 'UserA', 'contract': '4S+1', 'score': 450},
        {'id': 2, 'username': 'UserB', 'contract': '3NT-2', 'score': -200}
    ]
    return jsonify(mock_records)

# ------------------------------------
# 启动服务器
# ------------------------------------
if __name__ == '__main__':
    # 运行 Flask 服务器
    app.run(debug=True, port=5000)
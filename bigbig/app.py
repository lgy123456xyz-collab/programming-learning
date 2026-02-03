# app.py
from flask import Flask, request, jsonify, session, g
from models import db, User, MatchRecord # 假设 MatchRecord 已在 models.py 中定义
from flask_cors import CORS 
from functools import wraps 
from sqlalchemy.exc import IntegrityError 
from datetime import datetime # 用于 MatchRecord 的时间戳

app = Flask(__name__)

# 配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bridge_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'a_very_simple_secret_key' 
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 
app.config['SESSION_COOKIE_SECURE'] = False 

db.init_app(app)
CORS(app, supports_credentials=True) 

# --- IMP 换算逻辑 ---
IMP_TABLE_BOUNDARIES = [
    20, 50, 90, 130, 170, 220, 270, 320, 370, 430, 
    500, 600, 750, 900, 1100, 1300, 1500, 1750, 2000, 2250, 
    2500, 3000, 3500, 4000
]

def get_imp_value(diff):
    """将分数差额转换为 IMP 值 (标准版本)"""
    abs_diff = abs(diff)
    if abs_diff <= 20: return 0
    
    for i, boundary in enumerate(IMP_TABLE_BOUNDARIES):
        if abs_diff <= boundary:
            return i + 1
            
    if abs_diff > 4000:
        imp = 23
        remaining_diff = abs_diff - 4000
        imp += remaining_diff // 500
        return imp

    return 0

# --- 数据库操作辅助函数 ---

def get_or_create_user(username):
    """如果用户不存在，则创建新用户，并设置默认密码 '123'"""
    user = User.query.filter_by(username=username).first()
    if user is None:
        try:
            # 默认密码为 '123'，角色为 'normal'
            new_user = User(username=username, password='123', role='normal')
            db.session.add(new_user)
            db.session.commit()
            return new_user
        except IntegrityError:
            db.session.rollback()
            return None
    return user

def update_user_stats(user, imp_change, is_rollback=False):
    """根据IMP变化更新用户的分数和胜负平统计"""
    sign = -1 if is_rollback else 1
    
    user.score += sign * imp_change
    
    # 统计回滚或更新
    if imp_change > 0:
        user.wins += sign * 1
    elif imp_change < 0:
        user.losses += sign * 1
    else:
        user.draws += sign * 1
    
    db.session.add(user)


# --- 初始化和中间件 ---

with app.app_context():
    db.create_all()
    # 确保管理员存在
    if not User.query.filter_by(username='admin').first():
        admin_user = User(username='admin', password='123', role='admin')
        db.session.add(admin_user)
        db.session.commit()
        print("✅ 已创建默认管理员用户: admin/123")
    
@app.before_request
def load_user():
    user_id = session.get('user_id')
    if user_id is not None:
        g.user = User.query.get(user_id)
    else:
        g.user = None

def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.user:
            return jsonify({'message': '请先登录'}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.user or g.user.role != 'admin':
            return jsonify({'message': '权限不足'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- 认证和登出路由 ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '请提供用户名和密码'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': '用户名已被注册'}), 400

    new_user = User(username=username, password=password, role='normal')
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'id': new_user.id, 'username': new_user.username, 'role': new_user.role}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        session['user_id'] = user.id 
        return jsonify({'id': user.id, 'username': user.username, 'role': user.role})
    else:
        return jsonify({'message': '无效的用户名或密码'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': '登出成功'})

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """返回当前用户的登录状态和角色，用于调试。"""
    if g.user:
        return jsonify({
            'is_logged_in': True,
            'username': g.user.username,
            'role': g.user.role,
            'user_id': g.user.id,
            'message': '✅ 已成功登录'
        })
    else:
        return jsonify({
            'is_logged_in': False,
            'message': '❌ 未登录或会话丢失'
        }), 401

# ------------------------------------
# 路由 4: 排行榜 /api/leaderboard
# ------------------------------------
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    users = User.query.order_by(User.score.desc()).all()
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
# 路由 5: 记录比赛结果 /api/admin/record_match (已移除管理员权限要求)
# ------------------------------------
# 警告: 仅要求登录，所有登录用户都可以提交比赛结果
@app.route('/api/admin/record_match', methods=['POST'])
@require_login  
def record_match():
    data = request.get_json()
    
    ns_username = data.get('ns_username')
    ns_partner_username = data.get('ns_partner_username')
    ew_username = data.get('ew_username')
    ew_partner_username = data.get('ew_partner_username')
    score_diff = int(data.get('score_diff', 0))

    usernames = [ns_username, ns_partner_username, ew_username, ew_partner_username]
    if len(set(usernames)) != 4:
        return jsonify({'message': '四名玩家必须不同'}), 400
    
    # 1. 自动创建或获取用户
    users_objects = {}
    for uname in usernames:
        user = get_or_create_user(uname)
        if user is None:
            return jsonify({'message': '用户创建失败，请稍后重试'}), 500
        users_objects[uname] = user

    ns1, ns2, ew1, ew2 = (
        users_objects[ns_username], 
        users_objects[ns_partner_username], 
        users_objects[ew_username], 
        users_objects[ew_partner_username]
    )

    # 2. 计算 IMP 值
    imp_value = get_imp_value(score_diff)
    ns_imp = imp_value if score_diff >= 0 else -imp_value
    ew_imp = -ns_imp

    # 3. 更新用户积分和统计
    for user in [ns1, ns2]:
        update_user_stats(user, ns_imp)
        
    for user in [ew1, ew2]:
        update_user_stats(user, ew_imp)
        
    # 4. 记录比赛 
    record = MatchRecord(
        ns1_id=ns1.id, ns2_id=ns2.id, 
        ew1_id=ew1.id, ew2_id=ew2.id,
        ns_imp=ns_imp, ew_imp=ew_imp, 
        score_diff=score_diff
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'message': f'✅ 比赛结果记录成功。NS ( {ns1.username}, {ns2.username} ) 获得 IMP: {ns_imp}，EW ( {ew1.username}, {ew2.username} ) 获得 IMP: {ew_imp}',
        'ns_imp': ns_imp,
        'ew_imp': ew_imp,
        'record_id': record.id
    })


# ------------------------------------
# 路由 6: 管理员用户列表 /api/admin/users
# ------------------------------------
@app.route('/api/admin/users', methods=['GET'])
@require_admin
def admin_users():
    users = User.query.all()
    user_list = [{'id': u.id, 'username': u.username, 'role': u.role, 'score': u.score} for u in users]
    return jsonify(user_list)


# ------------------------------------
# 路由 7: 管理员历史记录 /api/admin/history
# ------------------------------------
@app.route('/api/admin/history', methods=['GET'])
@require_admin
def admin_history():
    records = MatchRecord.query.order_by(MatchRecord.recorded_at.desc()).all()
    
    # 优化查询：一次性获取所有用户 ID 和用户名映射
    all_user_ids = set()
    for r in records:
        all_user_ids.update([r.ns1_id, r.ns2_id, r.ew1_id, r.ew2_id])
    
    user_map = {u.id: u.username for u in User.query.filter(User.id.in_(all_user_ids)).all()}

    history_list = []
    for r in records:
        data = r.serialize()
        data['ns_players'] = (user_map.get(r.ns1_id, f"ID:{r.ns1_id}"), user_map.get(r.ns2_id, f"ID:{r.ns2_id}"))
        data['ew_players'] = (user_map.get(r.ew1_id, f"ID:{r.ew1_id}"), user_map.get(r.ew2_id, f"ID:{r.ew2_id}"))
        history_list.append(data)
        
    return jsonify(history_list)


# ------------------------------------
# 路由 8: 删除历史记录 /api/admin/delete_record/<id>
# ------------------------------------
@app.route('/api/admin/delete_record/<int:record_id>', methods=['DELETE'])
@require_admin
def delete_record(record_id):
    record = MatchRecord.query.get(record_id)
    if not record:
        return jsonify({'message': '记录不存在'}), 404

    # 1. 识别并加载玩家
    user_ids = [record.ns1_id, record.ns2_id, record.ew1_id, record.ew2_id]
    users_map = {u.id: u for u in User.query.filter(User.id.in_(user_ids)).all()}
    
    # 2. 回滚 NS 队积分
    for user_id in [record.ns1_id, record.ns2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, record.ns_imp, is_rollback=True)
            
    # 3. 回滚 EW 队积分
    for user_id in [record.ew1_id, record.ew2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, record.ew_imp, is_rollback=True)
            
    # 4. 删除记录
    db.session.delete(record)
    db.session.commit()

    return jsonify({'message': f'✅ 记录 ID {record_id} 已删除，所有玩家积分已回滚。'})

# ------------------------------------
# 路由 9: 修改历史记录 /api/admin/update_record/<id>
# ------------------------------------
@app.route('/api/admin/update_record/<int:record_id>', methods=['PUT'])
@require_admin
def update_record(record_id):
    record = MatchRecord.query.get(record_id)
    if not record:
        return jsonify({'message': '记录不存在'}), 404
    
    data = request.get_json()
    new_score_diff = data.get('score_diff')
    
    if new_score_diff is None:
        return jsonify({'message': '请提供新的 score_diff'}), 400

    new_score_diff = int(new_score_diff)
    
    # 步骤 A: 回滚旧记录
    user_ids = [record.ns1_id, record.ns2_id, record.ew1_id, record.ew2_id]
    users_map = {u.id: u for u in User.query.filter(User.id.in_(user_ids)).all()}
    
    for user_id in [record.ns1_id, record.ns2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, record.ns_imp, is_rollback=True)
            
    for user_id in [record.ew1_id, record.ew2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, record.ew_imp, is_rollback=True)

    # 步骤 B: 计算新 IMP
    new_imp_value = get_imp_value(new_score_diff)
    new_ns_imp = new_imp_value if new_score_diff >= 0 else -new_imp_value
    new_ew_imp = -new_ns_imp

    # 步骤 C: 应用新积分并更新记录
    for user_id in [record.ns1_id, record.ns2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, new_ns_imp)
            
    for user_id in [record.ew1_id, record.ew2_id]:
        if user := users_map.get(user_id):
            update_user_stats(user, new_ew_imp)
            
    record.score_diff = new_score_diff
    record.ns_imp = new_ns_imp
    record.ew_imp = new_ew_imp
    record.recorded_at = datetime.utcnow() # 标记为最近修改
    
    db.session.commit()

    return jsonify({
        'message': f'✅ 记录 ID {record_id} 已更新。新分差: {new_score_diff}，新IMP: NS {new_ns_imp}, EW {new_ew_imp}',
        'record_id': record.id
    })


# ------------------------------------
# 启动服务器
# ------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
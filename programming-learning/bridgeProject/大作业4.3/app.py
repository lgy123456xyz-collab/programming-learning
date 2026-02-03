from flask import Flask, request, jsonify, session, send_file, render_template
from functools import wraps
from models import db, User, MatchRecord, PendingRecord
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash 
import math 

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bridge_center.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_super_secret_key_bridge_123' 
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# 固定密钥
app.config['FIXED_ADMIN_KEY'] = 'DEV_BRIDGE_KEY_999' 

db.init_app(app)

from flask_cors import CORS
CORS(app, supports_credentials=True) 

# 初始化数据库和管理员账户
def create_admin_user():
    with app.app_context():
        db.create_all() 
        
        admin = User.query.filter_by(id='admin').first()
        if admin is None:
            admin_user = User(
                id='admin', 
                username='admin',
                password_hash=generate_password_hash('admin123'),
                role='admin',
                rating=1800 
            )
            db.session.add(admin_user)
            db.session.commit()
            print("--- 数据库初始化完成：已创建所有表及 admin 账户 ---")
        else:
            print("--- 数据库已就绪，跳过管理员创建 ---")

def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': '请先登录'}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_key = request.headers.get('X-Admin-Key')
        fixed_key = app.config.get('FIXED_ADMIN_KEY')
        
        if admin_key == fixed_key:
            return f(*args, **kwargs)
            
        if 'user_id' in session:
             user = User.query.get(session.get('user_id'))
             if user and user.role == 'admin':
                 return f(*args, **kwargs)
        
        return jsonify({'message': '未授权，管理员密钥错误或缺失，且未登录管理员账户'}), 401
            
    return decorated_function



def get_k_factor(R):
    """根据选手现有积分 R 确定发展系数 K。"""
    if R >= 2800:
        return 10
    elif R >= 2400:
        return 20
    elif R >= 2300:
        return 30
    elif R >= 2100:
        return 40
    elif R >= 1800:
        return 45
    else: 
        return 50

def calculate_expected_score(R, R_opp):
    """根据选手 R 和对手 R_opp 计算预期得分 E。"""

    return 1 / (1 + math.pow(10, (R_opp - R) / 400))

def calculate_elo_change(R, R_opp, S):
    """计算 Elo 积分变化值 R' - R。"""
    K = get_k_factor(R)
    E = calculate_expected_score(R, R_opp)

    return round(K * (S - E)) 



def get_or_create_user(username):
    """根据用户名获取用户，如果不存在则以 1800 初始积分创建新用户。"""
    user = User.query.filter_by(username=username).first()
    if user is None:
        try:
            user_id = username 
            user = User(
                id=user_id,
                username=username, 
                password_hash=generate_password_hash(''), 
                role='user',
                rating=1800 
            )
            db.session.add(user)
            db.session.commit()
            return user
        except Exception as e:
            db.session.rollback()
            print(f"创建用户失败: {e}")
            return None
    return user

def update_user_stats(user, rating_change, match_result, is_rollback=False, old_rating=None):
    """
    更新用户 rating, games, wins, ties, losses。
    match_result: 1 (Win), 0.5 (Tie), 0 (Loss)
    """
    

    user.games = user.games or 0
    user.wins = user.wins or 0
    user.ties = user.ties or 0
    user.losses = user.losses or 0
    user.rating = user.rating or 1800
    
    op = -1 if is_rollback else 1
    

    if not is_rollback:
        user.games += 1
        if match_result == 1:
            user.wins += op
        elif match_result == 0.5:
            user.ties += op
        elif match_result == 0:
            user.losses += op
    else:

        user.games = max(0, user.games - 1)
        if match_result == 1:
            user.wins = max(0, user.wins - 1)
        elif match_result == 0.5:
            user.ties = max(0, user.ties - 1)
        elif match_result == 0:
            user.losses = max(0, user.losses - 1)

  
    if not is_rollback:
        user.rating += rating_change
    elif old_rating is not None:

        user.rating = old_rating
    

    user.games = max(0, user.games)
    user.wins = max(0, user.wins)
    user.ties = max(0, user.ties)
    user.losses = max(0, user.losses)
    
    db.session.commit()


# 认证路由

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': '用户名和密码不能为空'}), 400

    if User.query.filter_by(id=username).first():
        return jsonify({'message': '用户名已存在'}), 400

    try:
        user = User(
            id=username,
            username=username, 
            password_hash=generate_password_hash(password),
            role='user'
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': '注册成功', 'username': username, 'role': user.role}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'注册失败: {e}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(id=username).first()
    
    if user and user.password_hash and check_password_hash(user.password_hash, password):
        session.permanent = True
        session['user_id'] = user.id
        return jsonify({
            'message': '登录成功', 
            'username': user.username,
            'id': user.id,
            'role': user.role
        }), 200
    
    return jsonify({'message': '用户名或密码错误'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': '登出成功'}), 200

@app.route('/api/auth/status', methods=['GET'])
def check_status():
    print("test")
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'is_logged_in': True,
                'user_id': user.id,
                'username': user.username,
                'role': user.role
            }), 200
    
    return jsonify({'is_logged_in': False, 'message': '未登录'}), 401


# 积分和比赛路由


# 路由:记录比赛结果
@app.route('/api/admin/record_match', methods=['POST'])
@require_admin 
def record_match():
    data = request.get_json()
    
    challenger_username = data.get('challenger_username')
    opponent_username = data.get('opponent_username')
    result_S = data.get('result_S') # Challenger 的得分 (1, 0.5, 0)
    
    try:
        challenger_S = float(result_S)
    except (TypeError, ValueError):
        return jsonify({'message': '比赛结果 S 值必须是 1, 0.5 或 0'}), 400

    usernames = [challenger_username, opponent_username]
    if not all(usernames) or len(set(usernames)) != 2:
        return jsonify({'message': '两位玩家必须不同且不能为空'}), 400
    
    users_objects = {}
    for uname in usernames:
        user = get_or_create_user(uname)
        if user is None:
            return jsonify({'message': f'玩家 {uname} 创建失败，请稍后重试'}), 500
        users_objects[uname] = user

    challenger_player = users_objects[challenger_username] 
    opponent_player = users_objects[opponent_username] 


    challenger_old_rating = challenger_player.rating
    opponent_old_rating = opponent_player.rating
    

    opponent_S = 1.0 - challenger_S

    challenger_rating_change = calculate_elo_change(
        challenger_player.rating, 
        opponent_player.rating, 
        challenger_S
    )

    opponent_rating_change = calculate_elo_change(
        opponent_player.rating, 
        challenger_player.rating, 
        opponent_S
    )
    

    outcome_map = {1.0: "胜", 0.5: "平", 0.0: "负"}
    match_outcome = f"挑战者 ({challenger_player.username}) {outcome_map.get(challenger_S, '未知')}"

    try:

        update_user_stats(challenger_player, challenger_rating_change, challenger_S, is_rollback=False)
        update_user_stats(opponent_player, opponent_rating_change, opponent_S, is_rollback=False)
            

        record = MatchRecord(
            ns1_id=challenger_player.id, ns2_id=challenger_player.id, 
            ew1_id=opponent_player.id, ew2_id=opponent_player.id, 

            score_diff=int(challenger_S * 1000), 
            ns_rating_change=challenger_rating_change, 
            ew_rating_change=opponent_rating_change, 
            ns_old_rating=challenger_old_rating, 
            ew_old_rating=opponent_old_rating 
        )
        db.session.add(record)
        db.session.commit()

        return jsonify({
            'message': f'✅ 比赛结果记录成功 ({match_outcome})。挑战者 rating 变化: {challenger_rating_change}，被挑战者 rating 变化: {opponent_rating_change}',
            'challenger_change': challenger_rating_change,
            'opponent_change': opponent_rating_change,
            'record_id': record.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'服务器记录比赛失败: {e}'}), 500



@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.filter(User.role != 'admin').order_by(User.rating.desc()).all()
    
    rank_list = []
    for user in users:
        rank_list.append({
            'id': user.id,
            'username': user.username,
            'rating': user.rating, 
            'games': user.games,   
            'wins': user.wins,     
            'ties': user.ties,     
            'losses': user.losses, 
        })
        
    return jsonify(rank_list)


# 路由:管理员历史记录
@app.route('/api/admin/history', methods=['GET'])
@require_admin
def admin_history():
    records = MatchRecord.query.order_by(MatchRecord.recorded_at.desc()).all()
    
    all_user_ids = set()
    for r in records:
        all_user_ids.update([r.ns1_id, r.ew1_id]) 
    
    user_map = {u.id: u.username for u in User.query.filter(User.id.in_(all_user_ids)).all()}

    history_list = []
    for r in records:
        recorded_at_str = r.recorded_at.isoformat() if r.recorded_at else None
        
        data = {
            'id': r.id,
            'ns_rating_change': r.ns_rating_change, 
            'ew_rating_change': r.ew_rating_change, 
            'score_diff': r.score_diff, 
            'recorded_at': recorded_at_str
        }
        
        data['ns_players'] = (user_map.get(r.ns1_id, f"ID:{r.ns1_id}"),) 
        data['ew_players'] = (user_map.get(r.ew1_id, f"ID:{r.ew1_id}"),) 
        history_list.append(data)
        
    return jsonify(history_list)


# 路由:删除历史记录 
@app.route('/api/admin/delete_record/<int:record_id>', methods=['DELETE'])
@require_admin
def delete_record(record_id):
    record = MatchRecord.query.get(record_id)
    if not record:
        return jsonify({'message': '记录不存在'}), 404

    challenger_id = record.ns1_id
    opponent_id = record.ew1_id
    
    user_ids = [challenger_id, opponent_id]
    users_map = {u.id: u for u in User.query.filter(User.id.in_(user_ids)).all()}
    
    challenger_S = record.score_diff / 1000.0 
    opponent_S = 1.0 - challenger_S

    try:
        if user := users_map.get(challenger_id):
            update_user_stats(user, record.ns_rating_change, challenger_S, is_rollback=True, old_rating=record.ns_old_rating)
            challenger_name = user.username
            
        if user := users_map.get(opponent_id):
            update_user_stats(user, record.ew_rating_change, opponent_S, is_rollback=True, old_rating=record.ew_old_rating)
            opponent_name = user.username
                
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'message': f'✅ 记录 ID {record_id} 已删除，挑战者 ({challenger_name}) 和被挑战者 ({opponent_name}) 积分已回滚。'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'服务器删除记录失败: {e}'}), 500


@app.route("/")
def root():
    with open("index.html", "rb")as f:
        return f.read()
    
# @app.route("/<path:file>")
# def file(file):
#     with open(file, "rb")as f:
#         return f.read()

@app.route("/<path:file>")
def file(file):
    # 检查文件是否在允许的列表中（如 style.css, script.js）
    # allowed_files = ['style.css', 'script.js', 'import_data.py', 'models.py'] # 根据您的目录结构调整


    #if file in allowed_files:
        # 确保文件存在且路径安全 (os.path.abspath)
    file_path = os.path.join(app.root_path, file)
    if os.path.exists(file_path):
        # send_file 会根据文件扩展名自动设置正确的 Content-Type
        return send_file(file_path)

    # 如果文件不存在，或者不在允许列表中，返回 404
    return jsonify({'message': '文件未找到或未授权'}), 404


# 以下叫牌提示系统功能代码


class TrieNode:
    def __init__(self):
        self.children = {}  
        self.hint = None   
        self.system = None

class BiddingTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, sequence, system, hint, forcing):
        """
        向 Trie 树中插入一条叫牌序列
        sequence: 格式如 '1N_P_P_X'
        forcing: 'Y' 表示逼叫
        """
        node = self.root
        parts = sequence.strip().upper().split('_')
        for part in parts:
            if part not in node.children:
                node.children[part] = TrieNode()
            node = node.children[part]
        
        node.system = system
        suffix = " [逼叫]" if forcing == 'Y' else ""
        node.hint = f"{hint}{suffix}"

    def search_exact(self, sequence):
        """
        完全匹配搜索：只有路径完全存在且终点有 hint 时才返回
        """
        if not sequence:
            return None
            
        node = self.root
        parts = sequence.strip().upper().split('_')
        
        for part in parts:
            if part in node.children:
                node = node.children[part]
            else:
                return None
        
        return node.hint

#业务逻辑处理

trie_db = BiddingTrie()

def load_data_into_trie(file_path):
    """从 bidding_db.txt 读取并构建内存索引"""
    global trie_db
    trie_db = BiddingTrie() 
    
        
    if not os.path.exists(file_path):
        print(f"Error: 找不到数据库文件 {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            count = 0
            for line in f:
                line = line.strip()
                if not line or '#' not in line:
                    continue
                
                # 格式参考: 1N_P_P_X#CBB#提示含义#Y#0#1#0
                parts = line.split('#')
                if len(parts) >= 3:
                    seq = parts[0]      # 叫牌序列
                    sys_name = parts[1] 
                    meaning = parts[2]  # 含义
                    is_forcing = parts[3] if len(parts) > 3 else 'N'
                    
                    trie_db.insert(seq, sys_name, meaning, is_forcing)
                    count += 1
            print(f"成功加载 {count} 条叫牌约定数据到 Trie 树。")
    except Exception as e:
        print(f"加载数据时发生异常: {e}")


@app.route('/bid')
def index():
    """主页面"""
    return send_file("bid.html")

@app.route('/get_hint', methods=['POST'])
def get_hint():
    """
    接收前端叫牌路径，返回约定含义
    """
    
    data = request.json
    current_sequence = data.get('sequence', "")
    
    hint = trie_db.search_exact(current_sequence)
    
    if hint:
        return jsonify({
            "status": "success",
            "hint": hint,
            "match": True
        })
    else:
        return jsonify({
            "status": "success",
            "hint": "暂无特定约定含义",
            "match": False
        })

#审核系统

@app.route('/api/audit/submit', methods=['POST'])
@require_login
def submit_audit():
    data = request.get_json()
    challenger = data.get('challenger_username')
    opponent = data.get('opponent_username')
    result_S = data.get('result_S')
    
    user_id = session.get('user_id')
    
    if not challenger or not opponent or result_S is None:
        return jsonify({'message': '信息不全'}), 400

    new_pending = PendingRecord(
        challenger=challenger,
        opponent=opponent,
        result_S=float(result_S),
        submitted_by=user_id,
        status='Pending'
    )
    db.session.add(new_pending)
    db.session.commit()
    return jsonify({'message': '提交成功，请等待管理员审核'}), 201

@app.route('/api/audit/my_records', methods=['GET'])
@require_login
def get_my_records():
    user_id = session.get('user_id')
    records = PendingRecord.query.filter_by(submitted_by=user_id).order_by(PendingRecord.created_at.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'challenger': r.challenger,
        'opponent': r.opponent,
        'result_S': r.result_S,
        'status': r.status,
        'created_at': r.created_at.isoformat()
    } for r in records])



@app.route('/api/admin/audit_list', methods=['GET'])
@require_admin
def get_audit_list():
    pending = PendingRecord.query.filter_by(status='Pending').order_by(PendingRecord.created_at.asc()).all()
    return jsonify([{
        'id': r.id,
        'challenger': r.challenger,
        'opponent': r.opponent,
        'result_S': r.result_S,
        'submitted_by': r.submitted_by,
        'created_at': r.created_at.isoformat()
    } for r in pending])

@app.route('/api/admin/audit_action', methods=['POST'])
@require_admin
def audit_action():
    data = request.get_json()
    audit_id = data.get('audit_id')
    action = data.get('action')
    
    pending = PendingRecord.query.get(audit_id)
    if not pending:
        return jsonify({'message': '未找到该审核记录'}), 404
    
    try:
        if action == 'approve':
            c_change, o_change = process_match_logic(
                pending.challenger, 
                pending.opponent, 
                pending.result_S
            )
            pending.status = 'Approved'
            msg = f"已通过。积分变化: {c_change} / {o_change}"
        else:
            pending.status = 'Rejected'
            msg = "已拒绝该申请"
            
        db.session.commit()
        return jsonify({'message': msg})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"处理失败: {str(e)}"}), 500
        

def process_match_logic(challenger_username, opponent_username, result_S):
    """
    通用比赛处理逻辑：获取用户 -> 计算 Elo -> 更新统计 -> 存入 MatchRecord
    """
    challenger_S = float(result_S)
    opponent_S = 1.0 - challenger_S

    challenger_player = get_or_create_user(challenger_username)
    opponent_player = get_or_create_user(opponent_username)
    
    if not challenger_player or not opponent_player:
        raise Exception("无法加载或创建选手账户")

    c_old_rating = challenger_player.rating
    o_old_rating = opponent_player.rating

    c_change = calculate_elo_change(c_old_rating, o_old_rating, challenger_S)
    o_change = calculate_elo_change(o_old_rating, c_old_rating, opponent_S)

    update_user_stats(challenger_player, c_change, challenger_S)
    update_user_stats(opponent_player, o_change, opponent_S)

    new_record = MatchRecord(
        ns1_id=challenger_player.id, ns2_id=challenger_player.id,
        ew1_id=opponent_player.id, ew2_id=opponent_player.id,
        score_diff=int(challenger_S * 1000),
        ns_rating_change=c_change,
        ew_rating_change=o_change,
        ns_old_rating=c_old_rating,
        ew_old_rating=o_old_rating
    )
    db.session.add(new_record)
    return c_change, o_change        





if __name__ == '__main__':
    create_admin_user() 
    load_data_into_trie(os.path.join(os.path.dirname(__file__), 'bidding_db.txt'))
    app.run(debug=True, port=5000)
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'bridge_master_key' # 生产环境请修改
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bridge.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- 数据库模型 ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False) # 明文存储，仅用于演示
    rating = db.Column(db.Integer, default=1000)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    draws = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Boolean, default=False)

class MatchRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    winner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    loser_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    rating_change = db.Column(db.Integer)

# --- 辅助函数 ---

# 简单的 ELO 算法简化版
def calculate_elo_change(winner_rating, loser_rating):
    expected_score = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    k_factor = 32
    change = int(k_factor * (1 - expected_score))
    return max(change, 1) # 至少变动1分

# 桥牌基本算分 (简化版，用于演示)
def calculate_bridge_score(level, suit, doubled, vul, tricks_made):
    # 这是一个极其简化的逻辑，完整逻辑需要处理所有花色和加倍情况
    contract_points = 0
    base = 20 if suit in ['C', 'D'] else 30
    if suit == 'NT': base = 40 # 第一墩NT 40
    
    # ...此处省略复杂的桥牌算分细节，直接用简易公式演示...
    # 实际应用中建议使用现成的库或完整查找表
    score = (base * level) 
    if suit == 'NT': score += 10 # 补足NT首墩
    
    if score >= 100: score += 300 if not vul else 500 # 局分
    else: score += 50 # 部分分
    
    return score

# IMP 换算表
def imp_scale(diff):
    diff = abs(diff)
    if diff < 20: return 0
    if diff < 50: return 1
    if diff < 90: return 2
    if diff < 130: return 3
    if diff < 170: return 4
    if diff < 220: return 5
    if diff < 270: return 6
    if diff < 320: return 7
    if diff < 370: return 8
    if diff < 430: return 9
    if diff < 500: return 10
    if diff < 600: return 11
    if diff < 750: return 12
    if diff < 900: return 13
    if diff < 1100: return 14
    if diff < 1300: return 15
    if diff < 1500: return 16
    if diff < 1750: return 17
    if diff < 2000: return 18
    if diff < 2250: return 19
    if diff < 2500: return 20
    if diff < 3000: return 21
    if diff < 3500: return 22
    if diff < 4000: return 23
    return 24

# --- 路由 ---

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    users = User.query.order_by(User.rating.desc()).all()
    return render_template('dashboard.html', users=users, current_user_id=session['user_id'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        action = request.form['action']
        
        if action == 'register':
            if User.query.filter_by(username=username).first():
                flash('用户名已存在')
            else:
                # 第一个注册的用户自动设为管理员
                is_admin = (User.query.count() == 0)
                new_user = User(username=username, password=password, is_admin=is_admin)
                db.session.add(new_user)
                db.session.commit()
                flash('注册成功，请登录')
        
        elif action == 'login':
            user = User.query.filter_by(username=username, password=password).first()
            if user:
                session['user_id'] = user.id
                session['is_admin'] = user.is_admin
                return redirect(url_for('index'))
            else:
                flash('用户名或密码错误')
                
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/report_match', methods=['POST'])
def report_match():
    if 'user_id' not in session: return redirect(url_for('login'))
    
    winner_id = int(request.form['winner'])
    loser_id = int(request.form['loser'])
    
    if winner_id == loser_id:
        flash("不能自己和自己对战")
        return redirect(url_for('index'))

    winner = User.query.get(winner_id)
    loser = User.query.get(loser_id)
    
    change = calculate_elo_change(winner.rating, loser.rating)
    
    winner.rating += change
    winner.wins += 1
    loser.rating -= change
    loser.losses += 1
    
    record = MatchRecord(winner_id=winner_id, loser_id=loser_id, rating_change=change)
    db.session.add(record)
    db.session.commit()
    
    flash(f"比赛记录成功！赢家 +{change}, 输家 -{change}")
    return redirect(url_for('index'))

@app.route('/tools', methods=['GET', 'POST'])
def tools():
    imp_result = None
    score_result = None
    
    if request.method == 'POST':
        # IMP 计算
        if 'calc_imp' in request.form:
            try:
                score1 = int(request.form.get('score1', 0))
                score2 = int(request.form.get('score2', 0))
                diff = score1 - score2
                imps = imp_scale(diff)
                imp_result = f"分差: {diff}, IMPs: {imps} ({'我方胜' if diff > 0 else '对方胜'})"
            except ValueError:
                imp_result = "输入错误"
        
        # 简单得分计算 (这里仅演示基本定约输入)
        elif 'calc_score' in request.form:
             # 实际项目中这里需要解析定约
             score_result = "基础算分功能（需完善详细规则）"

    return render_template('tools.html', imp_result=imp_result, score_result=score_result)

@app.route('/admin')
def admin():
    if not session.get('is_admin'):
        flash("权限不足")
        return redirect(url_for('index'))
    
    matches = MatchRecord.query.order_by(MatchRecord.timestamp.desc()).all()
    return render_template('admin.html', matches=matches, User=User)

@app.route('/delete_match/<int:match_id>')
def delete_match(match_id):
    if not session.get('is_admin'): return redirect(url_for('index'))
    
    match = MatchRecord.query.get(match_id)
    if match:
        # 回滚分数
        winner = User.query.get(match.winner_id)
        loser = User.query.get(match.loser_id)
        if winner and loser:
            winner.rating -= match.rating_change
            winner.wins -= 1
            loser.rating += match.rating_change
            loser.losses -= 1
        
        db.session.delete(match)
        db.session.commit()
        flash("记录已删除并回滚分数")
    
    return redirect(url_for('admin'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
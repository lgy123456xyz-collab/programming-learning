# import_data.py

import os
from flask import Flask
from werkzeug.security import generate_password_hash
from app import db, User, MatchRecord # 从 app.py 导入配置和模型

# 初始化Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bridge_center.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'placeholder_key'
db.init_app(app)


# 要导入的 CSV 格式数据
CSV_DATA = """
Name,Standing,Rating,Games,Wins,Ties,Loses
RainGhost,19,2036,107,87,4,16
HueRay,31,1985,100,81,3,16
Yogurt0709,2,1934,56,29,2,25
吕长乐,3,1925,72,42,3,27
青雀,23,1922,47,24,5,18
Anthanhxixi,11,1919,47,28,0,19
simonlu,1,1912,65,34,7,24
hujingwen,40,1885,141,65,5,71
essangel,26,1868,12,4,3,5
zjz111,4,1866,10,4,1,5
手残党特派,29,1863,40,21,2,17
ZhouziWanderer,10,1843,7,3,0,4
泰勒斯的Benjamin,14,1841,44,22,3,19
poi123,20,1832,2,1,0,1
adlhi,42,1827,18,9,0,9
许昊天,36,1825,34,17,2,15
walnut_ustc,38,1821,25,11,0,14
abcjiu,30,1819,19,7,1,11
cuterk,44,1816,41,19,1,21
ChubbyWax,13,1814,34,16,0,18
sli,43,1808,2,1,0,1
weslieh,8,1800,5,1,1,3
土数豆的,27,1795,26,8,1,17
长空之影,37,1794,41,20,0,21
yf1164,15,1794,6,2,0,4
zqiang,28,1792,30,12,2,16
sparklingjuice,25,1788,7,2,0,5
xk22,5,1775,9,2,0,7
TGW咕噜噜咕噜,7,1768,14,4,0,10
Marfee,33,1765,10,2,0,8
PB22051089拜合提亚尔,9,1753,4,0,0,4
smirnov,21,1749,4,0,0,4
墨言ya,17,1745,18,4,0,14
突破自我,24,1744,10,2,0,8
愤怒的葡萄,6,1742,13,3,1,9
zzzcrl,34,1716,17,4,0,13
多多来哈哈,32,1709,7,0,0,7
largeoyos,22,1708,7,0,0,7
Minrain,18,1693,19,2,0,17
没有人是人类了,35,1683,10,0,1,9
zkdxrqp,39,1656,8,0,0,8
没能成为人类6657,12,1655,34,9,3,22
向往阳光158379,41,1654,27,3,2,22
dts_std,16,1616,13,1,0,12
"""

# 统一的默认密码哈希（用户无法登录，除非他们注册）
DEFAULT_HASH = generate_password_hash('default_password_for_import')

def import_leaderboard_data():
    """解析 CSV 数据并批量导入到 User 表中。"""
    
    print("--- 开始导入排行榜数据 ---")
    
    lines = CSV_DATA.strip().split('\n')[1:]
    
    with app.app_context():
        
        print(">> 清空现有非管理员用户和所有比赛记录...")
        db.session.query(User).filter(User.role == 'user').delete(synchronize_session=False)
        db.session.query(MatchRecord).delete(synchronize_session=False)
        db.session.commit()
        
        imported_count = 0
        
        for line in lines:
            try:
                name, standing, rating, games, wins, ties, loses = line.split(',')
                
                new_user = User(
                    id=name, 
                    username=name,
                    password_hash=DEFAULT_HASH, 
                    role='user',
                    rating=int(rating),
                    games=int(games),
                    wins=int(wins),
                    ties=int(ties),
                    losses=int(loses)
                )
                db.session.add(new_user)
                imported_count += 1
                
            except Exception as e:
                print(f"❌ 导入行失败: {line}. 错误: {e}")
                db.session.rollback()
                
        db.session.commit()
        print(f"--- ✅ 数据导入完成。成功导入 {imported_count} 条记录。 ---")
        
if __name__ == '__main__':
    import_leaderboard_data()
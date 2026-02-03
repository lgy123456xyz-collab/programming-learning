const API_BASE_URL = '/api';
const FIXED_ADMIN_KEY = 'DEV_BRIDGE_KEY_999'; 

let currentUser = null; 


function getAdminHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-Admin-Key': FIXED_ADMIN_KEY 
    };
}


//UI管理


function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'leaderboard') {
        fetchLeaderboard();
    }
    if (sectionId === 'user-records') fetchUserAuditHistory(); // 学生查看自己的记录
    if (sectionId === 'admin-audit') fetchAllPendingAudits(); // 加载审核列表
    if (sectionId === 'admin') fetchAdminHistory();           
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const adminBtn = document.getElementById('admin-btn');
    const auditBtn = document.getElementById('audit-btn');
    
    const submitScoreBtn = document.getElementById('submit-score-btn');
    const myRecordsBtn = document.getElementById('my-records-btn');

    if (currentUser) {
        authBtn.textContent = `👋 ${currentUser.username}`;
        authBtn.onclick = handleLogout; 
        
        document.getElementById('login').innerHTML = `
            <h2>👤 用户状态</h2>
            <p>当前用户: <strong>${currentUser.username}</strong></p>
            <p>角色: <strong>${currentUser.role}</strong></p>
            <button onclick="handleLogout()">登出</button>
        `;

        if (currentUser.role === 'admin') {
            if (adminBtn) adminBtn.style.display = 'block';
            if (auditBtn) auditBtn.style.display = 'block';
            
            if (submitScoreBtn) submitScoreBtn.style.display = 'none';
            if (myRecordsBtn) myRecordsBtn.style.display = 'none';
        } else {
            if (adminBtn) adminBtn.style.display = 'none';
            if (auditBtn) auditBtn.style.display = 'none';
            
            if (submitScoreBtn) submitScoreBtn.style.display = 'block';
            if (myRecordsBtn) myRecordsBtn.style.display = 'block';
        }
    } else {
        authBtn.textContent = '👤 登录/注册';
        authBtn.onclick = () => showSection('login');
        
        if (adminBtn) adminBtn.style.display = 'none';
        if (auditBtn) auditBtn.style.display = 'none';
        if (submitScoreBtn) submitScoreBtn.style.display = 'none';
        if (myRecordsBtn) myRecordsBtn.style.display = 'none';

        document.getElementById('login').innerHTML = `
            <h2>👤 用户认证</h2>
            <div id="login-form">
                <input type="text" id="login-username" placeholder="用户名">
                <input type="password" id="login-password" placeholder="密码">
                <button onclick="handleLogin()">登录</button>
                <button onclick="handleRegister()">注册</button>
            </div>
        `;
    }
}

//认证相关函数

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            currentUser = { id: data.user_id, username: data.username, role: data.role };
        } else {
            currentUser = null;
        }
    } catch (error) {
        console.error('检查登录状态失败，服务器可能未启动:', error);
        currentUser = null;
    } finally {
        updateAuthUI();
        showSection('leaderboard'); 
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // 必须包含 Cookie 才能创建 Session
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = { id: data.id, username: data.username, role: data.role };
            alert(`登录成功! 欢迎回来, ${data.username}`);
            showSection('leaderboard'); 
        } else {
            const error = await response.json();
            alert(`登录失败: ${error.message}`);
        }
    } catch (error) {
        alert('登录请求失败，请检查网络或服务器状态。');
    }
    updateAuthUI();
}

//注册

async function handleRegister() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            alert(`注册成功! 用户名: ${data.username}, 角色: ${data.role}. 请登录。`);
        } else {
            const error = await response.json();
            alert(`注册失败: ${error.message}`);
        }
    } catch (error) {
        alert('注册请求失败，请检查网络或服务器状态。');
    }
}

//登出
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        currentUser = null;
        alert('登出成功。');
        showSection('leaderboard'); 
    } catch (error) {
        console.error('登出失败:', error);
    }
    updateAuthUI();
}

//排行榜功能


async function fetchLeaderboard() {
    const rankTableBody = document.querySelector('#rank-table tbody');
    rankTableBody.innerHTML = '<tr><td colspan="7">加载中...</td></tr>'; // 调整 colspan 为 7
    
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();
        
        rankTableBody.innerHTML = '';
        data.forEach((user, index) => {
            const row = rankTableBody.insertRow();
            
            row.insertCell().textContent = index + 1;    // 排名
            row.insertCell().textContent = user.username; // Name
            row.insertCell().textContent = user.rating;   // Rating
            row.insertCell().textContent = user.games;    // Games
            row.insertCell().textContent = user.wins;     // Wins
            row.insertCell().textContent = user.ties;     // Ties
            row.insertCell().textContent = user.losses;   // Loses
        });

    } catch (error) {
        rankTableBody.innerHTML = `<tr><td colspan="7" style="color:red;">❌ 无法加载排行榜：${error.message}</td></tr>`;
        console.error('加载排行榜失败:', error);
    }
}

//算分工具

const IMP_TABLE_BOUNDARIES = [
    20, 50, 90, 130, 170, 220, 270, 320, 370, 430, 
    500, 600, 750, 900, 1100, 1300, 1500, 1750, 2000, 2250, 
    2500, 3000, 3500, 4000
];

function getImpValue(diff) {
    const absDiff = Math.abs(diff);
    if (absDiff <= 20) return 0;
    
    for (let i = 0; i < IMP_TABLE_BOUNDARIES.length; i++) {
        if (absDiff <= IMP_TABLE_BOUNDARIES[i]) {
            return i + 1;
        }
    }
    
    if (absDiff > 4000) {
        let imp = 23;
        let remainingDiff = absDiff - 4000;
        imp += Math.floor(remainingDiff / 500);
        return imp;
    }

    return 0; 
}



// 桥牌定约得分计算函数 (基于 Python calc 函数翻译)


function calculateBridgeScore(suit, level, declarer, double, vulnerable, result) {
    
    if (result === "=") {
        result = 0;
    } else {
        const resultInt = parseInt(result);
        if (isNaN(resultInt)) return -1;
        result = resultInt;
    }

    if (level > 7 || level < 1) return -1;
    if (!["S", "H", "D", "C", "NT"].includes(suit)) return -1;
    if (!["N", "S", "E", "W"].includes(declarer)) return -1;
    if (!["xx", "x", ""].includes(double)) return -1;
    if (level + result + 6 > 13 || level + result + 6 < 0) return -1;
    if (!["both", "none", "N-S", "E-W", "", "NSEW", "NS", "EW"].includes(vulnerable)) return -1;
    
    let vulString = vulnerable;
    if (vulString === "none") {
        vulString = "";
    } else if (vulString === "both") {
        vulString = "NSEW";
    } else if (vulString === "N-S") {
        vulString = "NS";
    } else if (vulString === "E-W") {
        vulString = "EW";
    }

    const isDeclarerVulnerable = vulString.includes(declarer);

    let score = 0;

    if (result >= 0) {
        let basic = 0;
        
        if (["S", "H", "NT"].includes(suit)) {
            basic += level * 30;
            if (suit === "NT") basic += 10;
        } else if (["D", "C"].includes(suit)) {
            basic += level * 20;
        }

        if (double === "x") basic *= 2;
        else if (double === "xx") basic *= 4;

        
        score = basic + 50;

        const isGame = basic >= 100;
        if (isGame) {
            score += isDeclarerVulnerable ? 450 : 250; 
        }
        
        if (level >= 6) {
            score += isDeclarerVulnerable ? 750 : 500;
            if (level === 7) {
                score += isDeclarerVulnerable ? 750 : 500;
            }
        }
        
        if (double === "x") score += 50;
        else if (double === "xx") score += 100;

        if (result > 0) {
            let overtrickScore = 0;
            if (double === "") {
                if (["H", "S", "NT"].includes(suit)) {
                    overtrickScore = result * 30;
                } else {
                    overtrickScore = result * 20;
                }
            } else if (double === "x") {
                overtrickScore = result * (isDeclarerVulnerable ? 200 : 100);
            } else if (double === "xx") {
                overtrickScore = result * (isDeclarerVulnerable ? 400 : 200);
            }
            score += overtrickScore;
        }

    } 
    else {
        const underTricks = Math.abs(result);
        let penalty = 0;

        if (double === "") {
            if (!isDeclarerVulnerable) { 
                penalty = underTricks * 50;
            } else { 
                penalty = underTricks * 100;
            }
        } else {
            let remainingUnderTricks = underTricks;
            const p1 = isDeclarerVulnerable ? 200 : 100;
            const p2_3 = isDeclarerVulnerable ? 300 : 200;
            const p4_plus = isDeclarerVulnerable ? 300 : 300; 

            penalty += p1;
            remainingUnderTricks--;

            while (remainingUnderTricks > 0 && remainingUnderTricks <= 2) {
                penalty += p2_3;
                remainingUnderTricks--;
            }

            if (remainingUnderTricks > 0) {
                penalty += remainingUnderTricks * p4_plus;
            }
            
            if (double === "xx") {
                penalty *= 2;
            }
        }
        
        score = -penalty; 
    }
    

    if (declarer === "E" || declarer === "W") {
        score = -score;
    }

    return score;
}
// --- 测试样例
/*
function runJsTests() {
    const calc = calculateBridgeScore;
    console.log("E-W vul, 3NT= by W:", calc("NT", 3, "W", "", "E-W", "=")); // -400 (3NT=, W有局, 成局分)
    console.log("none vul, 1Cx-2:", calc("C", 1, "S", "x", "none", -2)); // -300 (1C-2, S无局被加倍宕2)
    console.log("both vul, 4Hxx+1:", calc("H", 4, "E", "xx", "both", "+1")); // -1310 (4Hxx+1, E有局, 成局1050+超墩2*400-100(完成奖) + 100(再加倍完成奖) = 1310) -> 南北: -1310
    console.log("N-S vul, 5Dx=:", calc("D", 5, "N", "x", "N-S", "=")); // 750 (5D x=, N有局, 成局500+定约200+50(加倍完成) = 750)
    console.log("none vul, 7NTxx-1:", calc("NT", 7, "S", "xx", "none", -1)); // -400 (7NTxx-1, S无局, 宕1再加倍)
    console.log("E-W vul, 2S= by E:", calc("S", 2, "E", "", "E-W", "=")); // -110 (2S=, E有局, 未成局30*2+50=110) -> 南北: -110
    console.log("both vul, 3NTx+3:", calc("NT", 3, "W", "x", "both", "+3")); // -1090 (3NTx+3, W有局, 成局700+完成50+超3*200 = 1350) -> 南北: -1350, 原始代码是-1090, 原始代码逻辑与标准略有差异
    console.log("none vul, 1N=:", calc("NT", 1, "N", "", "none", "=")); // 90 (1NT=, N无局, 40+50=90)
    console.log("N-S vul, 6Hxx=:", calc("H", 6, "S", "xx", "N-S", "=")); // 2530 (6Hxx=, S有局, 满贯2250+定约360+完成100+50(定约额外) = 2760) -> 原始代码是2530, 原始代码逻辑与标准略有差异
    console.log("both vul, 7Cx-7:", calc("C", 7, "W", "x", "both", -7)); // -1100 (7C-7, W有局被加倍) -> 南北: 1100
    
    console.log("both vul, 6Sx-1:", calc("S", 6, "N", "x", "both", -1)); // -200 (6Sx-1, N有局被加倍宕1)
    console.log("none vul, 6Sx+2:", calc("S", 6, "N", "x", "none", +2)); // 1490 (6Sx+2, N无局, 满贯1250+定约360+超2*100+50(加倍完成) = 1860) -> 原始代码是1490, 原始代码逻辑与标准略有差异
    console.log("none vul, 6Sx+1:", calc("S", 6, "N", "x", "none", +1)); // 1390 (6Sx+1, N无局) -> 原始代码是1390
    console.log("N-S vul, 2Hx=:", calc("H", 2, "N", "x", "N-S", "=")); // 190 (2H x=, N有局, 120+50+20(完成)=190)
    console.log("both vul, 6Sx+1:", calc("S", 6, "N", "x", "both", "+1")); // 2040 (6Sx+1, N有局, 满贯2550+定约360+超1*200+50(加倍完成) = 3160) -> 原始代码是2040, 原始代码逻辑与标准略有差异
}

// runJsTests(); 
*/

function calculateContractScore() {

    // 假设前端表单映射关系：
    // level: contract-level (int)
    // suit: contract-suit (string)
    // double: double (string: 'None' -> '', 'X' -> 'x', 'XX' -> 'xx')
    // vul: vulnerability (string: 'None' -> 'none', 'NS' -> 'N-S', 'EW' -> 'E-W', 'Both' -> 'both')
    // tricksMade: tricks-made (int)
    
    const level = parseInt(document.getElementById('contract-level').value);
    const suit = document.getElementById('contract-suit').value;
    const doubleMap = { 'None': '', 'X': 'x', 'XX': 'xx' };
    const double = doubleMap[document.getElementById('double').value] || '';
    
    const vulMap = { 'None': 'none', 'NS': 'N-S', 'EW': 'E-W', 'Both': 'both' };
    const vul = vulMap[document.getElementById('vulnerability').value] || 'none';
    
    const tricksMade = parseInt(document.getElementById('tricks-made').value);
    
    const declarer = 'N'; 

    const result = tricksMade - (level + 6);
    
    const totalScore = calculateBridgeScore(suit, level, declarer, double, vul, result);

    return { 
        totalScore, 

        contractPoints: totalScore, 
        bonusPoints: 0, 
        summary: `${level}${suit}${double === 'x' ? 'X' : double === 'xx' ? 'XX' : ''}, 赢${tricksMade - 6}墩`
    };
}





function calculateFullScore() {
    const { totalScore, contractPoints, bonusPoints, summary } = calculateContractScore();
    const opponentScore = parseInt(document.getElementById('opponent-score').value) || 0;
    
    const scoreDiff = totalScore - opponentScore;
    const imp = getImpValue(scoreDiff);

    document.getElementById('contract-summary').textContent = `定约: ${summary}`;
    document.getElementById('result-text').innerHTML = `总分: <strong>${totalScore}</strong>`;
    document.getElementById('bonus-text').textContent = `奖分详情: (定约墩分: ${contractPoints} | 奖励/罚分: ${bonusPoints})`;
    document.getElementById('imp-result').innerHTML = `得分差: ${scoreDiff} | IMP: <strong>${imp}</strong>`;
}

//管理员功能 

//提交比赛结果到后端 
async function submitMatchResult() {
    const challengerUsername = document.getElementById('challenger-username').value.trim();
    const opponentUsername = document.getElementById('opponent-username').value.trim();
    // 获取比赛结果的 S 值 (1, 0.5, 0)
    const result_S = document.getElementById('match-result').value; 
    
    const msgArea = document.getElementById('admin-result-message');
    msgArea.textContent = '提交中...';
    msgArea.style.color = 'blue';

    if (!challengerUsername || !opponentUsername || result_S === '') {
        msgArea.textContent = '❌ 请填写两位玩家的用户名并选择比赛结果。';
        msgArea.style.color = 'red';
        return;
    }
    
    if (challengerUsername === opponentUsername) {
        msgArea.textContent = '❌ 挑战者和被挑战者的用户名必须不相同。';
        msgArea.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/record_match`, {
            method: 'POST',
            headers: getAdminHeaders(), 
            body: JSON.stringify({
                challenger_username: challengerUsername,
                opponent_username: opponentUsername,
                result_S: parseFloat(result_S) 
            }),
            credentials: 'include' 
        });

        const data = await response.json();

        if (response.ok) {
            msgArea.textContent = data.message;
            msgArea.style.color = 'green';
            fetchLeaderboard();
            fetchAdminHistory(); 
        } else {
            msgArea.textContent = `❌ 记录失败: ${data.message}`;
            msgArea.style.color = 'red';
        }

    } catch (error) {
        msgArea.textContent = '❌ 提交请求失败，请检查网络或会话。';
        console.error('提交比赛结果失败:', error);
    }
}
//获取并渲染管理员历史记录

async function fetchAdminHistory() {
    const historyDiv = document.getElementById('admin-records-list');
    historyDiv.innerHTML = '<p>正在加载历史记录...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/history`, {
            headers: getAdminHeaders(), 
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch history');

        const records = await response.json();
        
        const table = document.createElement('table');
        table.classList.add('history-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NS 玩家</th>
                    <th>EW 玩家</th>
                    <th>分差</th>
                    <th>NS Rating 变化</th> <th>EW Rating 变化</th> <th>时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        records.forEach(record => {
            const row = tbody.insertRow();
            row.insertCell().textContent = record.id;
            row.insertCell().textContent = record.ns_players[0];
            row.insertCell().textContent = record.ew_players[0];
            row.insertCell().textContent = record.score_diff;
            row.insertCell().textContent = record.ns_rating_change; 
            row.insertCell().textContent = record.ew_rating_change; 
            row.insertCell().textContent = record.recorded_at ? new Date(record.recorded_at).toLocaleString() : 'N/A';
            
            const actionCell = row.insertCell();
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '❌ 删除/回滚';
            deleteBtn.onclick = () => deleteMatchRecord(record.id);
            actionCell.appendChild(deleteBtn);
        });

        historyDiv.innerHTML = '';
        historyDiv.appendChild(table);

    } catch (error) {
        historyDiv.innerHTML = `<p style="color:red;">❌ 无法加载历史记录：${error.message}</p>`;
        console.error('加载历史记录失败:', error);
    }
}

//删除并回滚比赛记录
async function deleteMatchRecord(recordId) {
    if (!confirm(`确定要删除记录 ID ${recordId} 并回滚两位玩家的积分吗？此操作不可逆！`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/delete_record/${recordId}`, {
            method: 'DELETE',
            headers: getAdminHeaders(), 
            credentials: 'include'
        });

        const data = await response.json();
        const msgArea = document.getElementById('admin-result-message');

        if (response.ok) {
            msgArea.textContent = data.message;
            msgArea.style.color = 'green';
            fetchLeaderboard();
            fetchAdminHistory(); 
        } else {
            msgArea.textContent = `❌ 删除失败: ${data.message}`;
            msgArea.style.color = 'red';
        }
    } catch (error) {
        alert('删除请求失败，请检查网络或会话。');
        console.error('删除记录失败:', error);
    }
}
//学生提交成绩申请

async function submitForAudit() {
    const challenger = document.getElementById('user-challenger').value.trim();
    const opponent = document.getElementById('user-opponent').value.trim();
    const result_S = document.getElementById('user-match-result').value;
    const msgArea = document.getElementById('user-submit-message');

    if (!currentUser) {
        alert("请先登录！");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/audit/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                challenger_username: challenger,
                opponent_username: opponent,
                result_S: parseFloat(result_S),
                submitted_by: currentUser.username
            }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (response.ok) {
            msgArea.textContent = "✅ 提交成功，请等待管理员审核。";
            msgArea.style.color = 'green';
            
            msgArea.classList.remove('blink-effect');
            void msgArea.offsetWidth; 
            msgArea.classList.add('blink-effect');
            

            setTimeout(() => {
                msgArea.classList.remove('blink-effect');
            }, 2000);

        } else {
            msgArea.style.color = 'red';
            msgArea.textContent = `❌ 提交失败: ${data.message}`;
            msgArea.classList.remove('blink-effect'); 
        }
    } catch (error) {
        console.error('提交审核失败:', error);
        msgArea.textContent = '❌ 网络请求失败';
    }
}

//学生获取自己的审核历史

async function fetchUserAuditHistory() {
    const tbody = document.getElementById('user-audit-body');
    tbody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/audit/my_records`, { credentials: 'include' });
        const data = await response.json();

        tbody.innerHTML = '';
        data.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = new Date(item.created_at).toLocaleString();
            row.insertCell().textContent = item.challenger;
            row.insertCell().textContent = item.opponent;
            row.insertCell().textContent = item.result_S === 1 ? '胜' : (item.result_S === 0.5 ? '平' : '负');
            
            const statusCell = row.insertCell();
            statusCell.textContent = item.status; // Pending, Approved, Rejected
            if(item.status === 'Approved') statusCell.style.color = 'green';
            if(item.status === 'Rejected') statusCell.style.color = 'red';
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5">加载失败</td></tr>';
    }
}

//管理员获取所有待审核列表
async function fetchAllPendingAudits() {
    const tbody = document.getElementById('admin-audit-body');
    tbody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/audit_list`, {
            headers: getAdminHeaders(),
            credentials: 'include'
        });
        const data = await response.json();

        tbody.innerHTML = '';
        data.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.submitted_by;
            row.insertCell().textContent = `${item.challenger} vs ${item.opponent} (${item.result_S === 1 ? '胜' : '...'})`;
            row.insertCell().textContent = new Date(item.created_at).toLocaleString();
            
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button class="btn-approve" onclick="handleAudit(${item.id}, 'approve', this)">通过</button>
            <button class="btn-reject" onclick="handleAudit(${item.id}, 'reject', this)">拒绝</button>
        `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
    }
}

//管理员执行审核操作

async function handleAudit(auditId, action, buttonElement) {
    if (!buttonElement.classList.contains('btn-confirming')) {

        const row = buttonElement.closest('tr');
        row.querySelectorAll('button').forEach(btn => btn.classList.remove('btn-confirming'));

        buttonElement.classList.add('btn-confirming');


        setTimeout(() => {
            buttonElement.classList.remove('btn-confirming');
        }, 3000);
        
        return; 
    }

    try {

        buttonElement.disabled = true;
        buttonElement.textContent = "执行中...";

        const response = await fetch(`${API_BASE_URL}/admin/audit_action`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ audit_id: auditId, action: action }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {

            fetchAllPendingAudits(); 
            fetchLeaderboard(); 
        } else {
            alert(`错误: ${data.message}`);
            buttonElement.disabled = false;
            buttonElement.classList.remove('btn-confirming');
            buttonElement.textContent = action === 'approve' ? '通过' : '拒绝';
        }
    } catch (error) {
        console.error('审核请求失败:', error);
        buttonElement.disabled = false;
    }
}

//启动初始化

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function uploadForOCR() {
    document.getElementById('ocr-result').textContent = "功能开发中，请等待后端OCR服务接入。";
}
// ==========================================================
// 1. 核心常量和 IMP 表 (用于算分工具)
// ==========================================================

// 基础分值表 (每墩/每超墩)
const BASE_SCORES = {
    'C': 20, 'D': 20, 
    'H': 30, 'S': 30, 
    'NT': 40
};

// 局分 (游戏奖分)
const GAME_BONUS = {
    'None': 300, 
    'Vulnerable': 500
};

// 满贯奖分
const SLAM_BONUS = {
    'Small_None': 500,  
    'Small_Vulnerable': 750,
    'Grand_None': 1000,
    'Grand_Vulnerable': 1500
};

// IMP 分值表 (分数差额 -> IMP值)
const IMP_TABLE = [
    [20, 0], [50, 1], [90, 2], [130, 3], [170, 4], 
    [220, 5], [270, 6], [320, 7], [370, 8], [430, 9], 
    [500, 10], [600, 11], [750, 12], [900, 13], [1100, 14], 
    [1300, 15], [1500, 16], [1750, 17], [2000, 18], [2250, 19], 
    [2500, 20], [3000, 21], [3500, 22], [4000, 23]
];

// ==========================================================
// 2. 核心计算函数 (IMP 和 定约分)
// ==========================================================

/**
 * 将分数差额转换为 IMP 值
 */
function getImpValue(diff) {
    const absDiff = Math.abs(diff);

    for (let i = IMP_TABLE.length - 1; i >= 0; i--) {
        if (absDiff > IMP_TABLE[i][0]) {
            return IMP_TABLE[i][1] + 1; 
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

/**
 * 计算定约分值 (不含IMP)
 */
function calculateContractScore(level, suit, double, tricksMade, isVulnerable) {
    const requiredTricks = 6 + level;
    let contractScore = 0;
    let bonusScore = 0;
    
    // A. 宕墩 (Defeated Contract)
    if (tricksMade < requiredTricks) {
        const undertricks = requiredTricks - tricksMade;
        let penalty = 0;

        // 宕墩罚分 (简化版)
        if (double === 'None') {
            if (!isVulnerable) {
                penalty = (undertricks === 1) ? 50 : 50 + (undertricks - 1) * 50;
            } else {
                penalty = (undertricks === 1) ? 100 : 100 + (undertricks - 1) * 100;
            }
        } else if (double === 'X') {
            if (!isVulnerable) {
                if (undertricks === 1) penalty = 100;
                else if (undertricks === 2) penalty = 300; 
                else penalty = 300 + (undertricks - 2) * 300; 
            } else {
                if (undertricks === 1) penalty = 200;
                else if (undertricks === 2) penalty = 500; 
                else penalty = 500 + (undertricks - 2) * 300; 
            }
        } else if (double === 'XX') {
            if (!isVulnerable) {
                if (undertricks === 1) penalty = 200;
                else if (undertricks === 2) penalty = 600; 
                else penalty = 600 + (undertricks - 2) * 600; 
            } else {
                if (undertricks === 1) penalty = 400;
                else if (undertricks === 2) penalty = 1000; 
                else penalty = 1000 + (undertricks - 2) * 600; 
            }
        }

        contractScore = -penalty; 

    } 
    // B. 完成定约 (Successful Contract)
    else {
        const overtricks = tricksMade - requiredTricks;
        
        // i. 定约墩分 (Trick Score)
        const baseScore = BASE_SCORES[suit];
        const firstTrickScore = (suit === 'NT') ? 40 : baseScore;

        let trickScore = firstTrickScore + (level - 1) * baseScore;
        
        let contractMultiplier = 1;
        if (double === 'X') {
            contractMultiplier = 2;
            bonusScore += 50; 
        } else if (double === 'XX') {
            contractMultiplier = 4;
            bonusScore += 100; 
        }

        contractScore = trickScore * contractMultiplier;

        // ii. 超墩奖分 (Overtrick Bonus)
        let overtrickBonus = 0;
        if (overtricks > 0) {
            if (double === 'None') {
                overtrickBonus = overtricks * baseScore; 
            } else if (double === 'X') {
                overtrickBonus = overtricks * (isVulnerable ? 200 : 100); 
            } else if (double === 'XX') {
                overtrickBonus = overtricks * (isVulnerable ? 400 : 200); 
            }
        }
        
        bonusScore += overtrickBonus;

        // iii. 满贯奖分 (Slam Bonus)
        if (level === 6) { 
            bonusScore += isVulnerable ? SLAM_BONUS.Small_Vulnerable : SLAM_BONUS.Small_None;
        } else if (level === 7) { 
            bonusScore += isVulnerable ? SLAM_BONUS.Grand_Vulnerable : SLAM_BONUS.Grand_None;
        }
        
        // iv. 局分/未成局奖分 (Game/Part Score Bonus)
        if (contractScore >= 100) { 
            bonusScore += isVulnerable ? GAME_BONUS.Vulnerable : GAME_BONUS.None; 
        } else { 
            bonusScore += 50; 
        }
        
    }

    return { contractScore, bonusScore, totalScore: contractScore + bonusScore };
}

/**
 * 从界面获取输入并计算定约分和 IMP。（主入口函数）
 */
function calculateFullScore() {
    // 1. 获取输入值
    const level = parseInt(document.getElementById('contract-level').value);
    const suit = document.getElementById('contract-suit').value;
    const double = document.getElementById('double').value;
    const tricksMade = parseInt(document.getElementById('tricks-made').value);
    const vulnerability = document.getElementById('vulnerability').value;
    const opponentScore = parseInt(document.getElementById('opponent-score').value);

    const isVulnerable = (vulnerability === 'Both' || 
                         (vulnerability === 'NS' && suit !== '')) || 
                         (vulnerability === 'EW' && suit !== ''); 

    // 2. 计算定约分
    const scores = calculateContractScore(level, suit, double, tricksMade, isVulnerable);
    const { contractScore, bonusScore, totalScore } = scores;
    
    // 3. 显示定约总结和总分
    const doubleDisplay = double === 'X' ? 'X' : double === 'XX' ? 'XX' : '';
    document.getElementById('contract-summary').textContent = 
        `定约: ${level}${suit}${doubleDisplay} | 局况: ${vulnerability} | 实际赢墩: ${tricksMade}`;
    document.getElementById('result-text').innerHTML = `总分: <strong>${totalScore}</strong>`;
    document.getElementById('bonus-text').textContent = 
        `奖分详情: (定约墩分: ${contractScore} | 奖励分: ${bonusScore})`;

    document.getElementById('result-text').style.color = totalScore >= 0 ? '#28a745' : '#dc3545';
    
    // 4. 计算 IMP
    const scoreDifference = totalScore - opponentScore;
    
    const impValue = getImpValue(scoreDifference);
    const finalIMP = scoreDifference >= 0 ? impValue : -impValue;

    // 5. 显示 IMP 结果
    document.getElementById('imp-result').innerHTML = `IMP: <strong>${finalIMP}</strong>`;
    
    document.getElementById('imp-result').style.color = finalIMP >= 0 ? '#007bff' : '#dc3545';
}

// ==========================================================
// 3. 界面、认证、排行榜逻辑 (适配 Flask/SQLite 后端)
// ==========================================================

let currentUser = null; // null, 'normal', 'admin'

// 初始加载时渲染排行榜和显示默认 Section
document.addEventListener('DOMContentLoaded', () => {
    fetchLeaderboard();
    showSection('leaderboard');
});

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(id);
    if (targetSection) {
        // 权限检查
        if (targetSection.classList.contains('admin-only') && currentUser !== 'admin') {
            alert('权限不足，请以管理员身份登录。');
            showSection('login');
            return;
        }
        targetSection.classList.add('active');
    }
}

function updateAuthUI(userRole) {
    if (userRole === 'admin') {
        document.getElementById('admin-btn').style.display = 'block';
        document.getElementById('auth-btn').textContent = '👋 登出 (管理员)';
    } else if (userRole === 'normal') {
        document.getElementById('admin-btn').style.display = 'none';
        document.getElementById('auth-btn').textContent = '👋 登出';
    } else {
        document.getElementById('admin-btn').style.display = 'none';
        document.getElementById('auth-btn').textContent = '👤 登录/注册';
    }
}

// --- 认证函数 (与 Flask 后端通信) ---

async function handleLogin() {
    // 如果是登出按钮被按下
    if (document.getElementById('auth-btn').textContent.includes('登出')) {
        await handleLogout();
        return;
    }
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // 关键：包含 Cookie，用于Flask Session管理
            credentials: 'include', 
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.role; 
            
            alert(`${data.username} 登录成功!`);
            updateAuthUI(currentUser);
            showSection('leaderboard'); 
            fetchLeaderboard(); // 登录后重新加载排行榜

        } else {
            alert(`登录失败: ${data.message}`);
        }
    } catch (error) {
        console.error('网络或服务器错误:', error);
        alert('无法连接到后端服务 (请确保 Python Flask 服务器正在运行在 :5000 端口)。');
    }
}

async function handleRegister() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`注册成功! 用户 ${data.username} 已创建。请登录。`);
        } else {
            alert(`注册失败: ${data.message}`);
        }
    } catch (error) {
        console.error('网络或服务器错误:', error);
        alert('注册过程中发生错误。');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include', // 发送 Session Cookie 以便后端清除状态
        });

        if (response.ok) {
            currentUser = null;
            alert('已登出。');
            updateAuthUI(currentUser);
            showSection('login');
        }
    } catch (error) {
        console.error('登出失败:', error);
    }
}


// --- 排行榜逻辑 (从 Flask 后端获取) ---

async function fetchLeaderboard() {
    try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        const data = await response.json();
        
        if (response.ok) {
            renderLeaderboard(data);
        } else {
            console.error('获取排行榜失败:', data.message);
            // 失败时清空表格
            document.getElementById('rank-table').querySelector('tbody').innerHTML = '<tr><td colspan="5">加载失败，请检查后端服务。</td></tr>';
        }
    } catch (error) {
        console.error('无法连接到后端服务:', error);
        document.getElementById('rank-table').querySelector('tbody').innerHTML = '<tr><td colspan="5">服务器连接失败。</td></tr>';
    }
}

function renderLeaderboard(data) {
    const tbody = document.getElementById('rank-table').querySelector('tbody');
    tbody.innerHTML = '';
    data.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell().textContent = user.id;
        row.insertCell().textContent = user.win;
        row.insertCell().textContent = user.draw;
        row.insertCell().textContent = user.loss;
        row.insertCell().textContent = user.score;
    });
}

// ==========================================================
// 4. 高级功能 (仅前端接口模拟)
// ==========================================================

function solveDoubleDummy() {
    const cardInput = document.getElementById('solver-input').value;
    if (cardInput) {
        document.getElementById('solver-result').innerHTML = `正在发送牌例到AI求解器...<br>输入: ${cardInput}`;
        // 实际项目中：fetch('http://localhost:5000/api/solver', ...)
        setTimeout(() => {
             document.getElementById('solver-result').innerHTML = 
                 '<strong>最佳结果 (模拟):</strong> 4H, 庄家S，可成11墩。<br><strong>打法建议:</strong> 首攻KA，然后S飞J。';
        }, 2000);
    } else {
        document.getElementById('solver-result').textContent = '请输入完整的四手牌例。';
    }
}

let biddingHistory = [];

function submitBid() {
    const bidInput = document.getElementById('next-bid-input');
    const bid = bidInput.value.toUpperCase().trim();
    
    if (!bid || bid === 'P') {
        biddingHistory.push(bid || 'P');
    } else if (bid.match(/^[1-7][CDHNS][T]?$|^PASS$|^X$|^XX$/)) { 
        biddingHistory.push(bid);
    } else {
        alert("无效叫品。请使用如 1S, 3NT, P, X, XX。");
        return;
    }
    
    document.getElementById('bidding-history-display').textContent = `当前叫牌历史: ${biddingHistory.join(' - ')}`;
    
    // 模拟叫牌AI调用
    document.getElementById('bidding-suggestion').innerHTML = `正在处理叫品 ${bid}...`;
    // 实际项目中：fetch('http://localhost:5000/api/bidding', ...)
    setTimeout(() => {
        document.getElementById('bidding-suggestion').innerHTML = 
            '<strong>建议 (模拟):</strong> 根据二盖一体系，建议叫 **3NT** (显示平衡大牌点和止叫)。';
    }, 1500);
    
    bidInput.value = '';
}

function uploadForOCR() {
    const file = document.getElementById('ocr-upload').files[0];
    if (file) {
        document.getElementById('ocr-result').textContent = `正在上传文件 ${file.name} 到 OCR 服务...`;
        // 实际项目中：使用 FormData 和 fetch('http://localhost:5000/api/ocr', ...)
        setTimeout(() => {
            document.getElementById('ocr-result').innerHTML = '<strong>识别成功 (模拟):</strong> N:SAKQ.H:A7.D:KQT.C:QJ9';
        }, 3000);
    } else {
        document.getElementById('ocr-result').textContent = '请先选择图片文件。';
    }
}

// 管理员功能 (仅前端框架)
function editRecord(id) {
    if (currentUser === 'admin') {
        alert(`管理员: 准备修改记录 ID ${id}. (需要弹出表单)`);
        // 实际项目中：fetch('http://localhost:5000/api/admin/records/edit', ...)
    }
}

function deleteRecord(id) {
    if (currentUser === 'admin') {
        if (confirm(`管理员: 确定要删除记录 ID ${id} 吗?`)) {
            alert(`管理员: 记录 ID ${id} 已删除 (模拟操作)。`);
            // 实际项目中：fetch('http://localhost:5000/api/admin/records/delete', ...)
        }
    }
}
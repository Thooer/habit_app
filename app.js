// 数据库管理
class Database {
    constructor() {
        this.dbName = 'habitTrackerDB';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify({
                habits: [],
                records: []
            }));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.dbName));
    }

    saveData(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    addHabit(name) {
        const data = this.getData();
        const habit = {
            id: Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            icon: '⭐'
        };
        data.habits.push(habit);
        this.saveData(data);
        return habit;
    }

    getHabits() {
        return this.getData().habits;
    }

    deleteHabit(id) {
        const data = this.getData();
        data.habits = data.habits.filter(h => h.id !== id);
        data.records = data.records.filter(r => r.habitId !== id);
        this.saveData(data);
    }

    checkIn(habitId) {
        const data = this.getData();
        const today = new Date().toISOString().split('T')[0];
        
        // 检查今天是否已打卡
        const exists = data.records.find(r => 
            r.habitId === habitId && r.date === today
        );
        
        if (exists) {
            return false;
        }

        data.records.push({
            id: Date.now(),
            habitId: habitId,
            date: today
        });
        this.saveData(data);
        return true;
    }

    isCheckedToday(habitId) {
        const data = this.getData();
        const today = new Date().toISOString().split('T')[0];
        return data.records.some(r => 
            r.habitId === habitId && r.date === today
        );
    }

    getRecords(habitId) {
        const data = this.getData();
        return data.records
            .filter(r => r.habitId === habitId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getStreak(habitId) {
        const records = this.getRecords(habitId);
        if (records.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let record of records) {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    getTotalChecks(habitId) {
        return this.getRecords(habitId).length;
    }

    getMaxStreak() {
        const habits = this.getHabits();
        let maxStreak = 0;
        
        for (let habit of habits) {
            const streak = this.getStreak(habit.id);
            if (streak > maxStreak) {
                maxStreak = streak;
            }
        }
        
        return maxStreak;
    }
}

// 全局变量
const db = new Database();
let currentPage = 'home';

// 页面切换
function switchPage(page) {
    currentPage = page;
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // 显示当前页面
    document.getElementById(page + 'Page').classList.add('active');
    document.querySelectorAll('.nav-item')[
        page === 'home' ? 0 : page === 'stats' ? 1 : 2
    ].classList.add('active');
    
    // 刷新页面内容
    if (page === 'home') {
        renderHabits();
    } else if (page === 'stats') {
        renderStats();
    } else if (page === 'achievement') {
        renderAchievements();
    }
}

// 渲染习惯列表
function renderHabits() {
    const habits = db.getHabits();
    const habitList = document.getElementById('habitList');
    const emptyState = document.getElementById('emptyState');
    
    if (habits.length === 0) {
        habitList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    habitList.innerHTML = habits.map(habit => {
        const isChecked = db.isCheckedToday(habit.id);
        const streak = db.getStreak(habit.id);
        const total = db.getTotalChecks(habit.id);
        
        return `
            <div class="habit-item">
                <div class="habit-info">
                    <div class="habit-name">${habit.icon} ${habit.name}</div>
                    <div class="habit-stats">连续 ${streak} 天 · 累计 ${total} 次</div>
                </div>
                <div class="check-btn ${isChecked ? 'checked' : ''}" 
                     onclick="checkIn(${habit.id})"
                     id="check-${habit.id}">
                    ${isChecked ? '✓' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 打卡
function checkIn(habitId) {
    const success = db.checkIn(habitId);
    
    if (success) {
        const btn = document.getElementById(`check-${habitId}`);
        btn.classList.add('checked', 'check-animation');
        btn.innerHTML = '✓';
        
        // 显示提示
        showToast('打卡成功！🎉');
        
        // 刷新列表
        setTimeout(() => {
            renderHabits();
        }, 300);
    } else {
        showToast('今天已经打卡过了');
    }
}

// 显示添加弹窗
function showAddModal() {
    document.getElementById('addModal').classList.add('show');
    document.getElementById('habitNameInput').value = '';
    document.getElementById('habitNameInput').focus();
}

// 隐藏添加弹窗
function hideAddModal() {
    document.getElementById('addModal').classList.remove('show');
}

// 添加习惯
function addHabit() {
    const input = document.getElementById('habitNameInput');
    const name = input.value.trim();
    
    if (!name) {
        showToast('请输入习惯名称');
        return;
    }
    
    db.addHabit(name);
    hideAddModal();
    renderHabits();
    showToast('添加成功！');
}

// 渲染统计
function renderStats() {
    const habits = db.getHabits();
    const statsGrid = document.getElementById('statsGrid');
    const habitStats = document.getElementById('habitStats');
    
    if (habits.length === 0) {
        statsGrid.innerHTML = '';
        habitStats.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>还没有数据</p></div>';
        return;
    }
    
    // 总体统计
    let totalChecks = 0;
    let maxStreak = 0;
    
    habits.forEach(habit => {
        totalChecks += db.getTotalChecks(habit.id);
        const streak = db.getStreak(habit.id);
        if (streak > maxStreak) maxStreak = streak;
    });
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${habits.length}</div>
            <div class="stat-label">习惯总数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalChecks}</div>
            <div class="stat-label">累计打卡</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${maxStreak}</div>
            <div class="stat-label">最长连续</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${habits.filter(h => db.isCheckedToday(h.id)).length}</div>
            <div class="stat-label">今日完成</div>
        </div>
    `;
    
    // 各习惯详细统计
    habitStats.innerHTML = habits.map(habit => {
        const streak = db.getStreak(habit.id);
        const total = db.getTotalChecks(habit.id);
        const records = db.getRecords(habit.id);
        
        // 计算完成率（最近30天）
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo);
        const completionRate = Math.round((recentRecords.length / 30) * 100);
        
        return `
            <div class="card">
                <div class="habit-name" style="margin-bottom: 12px;">${habit.icon} ${habit.name}</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${streak}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">连续天数</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--success);">${total}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">累计打卡</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--warning);">${completionRate}%</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">30天完成率</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染成就
function renderAchievements() {
    const maxStreak = db.getMaxStreak();
    
    const achievements = [
        { name: '初次尝试', icon: '🌟', requirement: 1, color: '#fbbf24' },
        { name: '坚持3天', icon: '🔥', requirement: 3, color: '#f59e0b' },
        { name: '一周达人', icon: '🏅', requirement: 7, color: '#ef4444' },
        { name: '半月英雄', icon: '💪', requirement: 15, color: '#ec4899' },
        { name: '月度冠军', icon: '👑', requirement: 30, color: '#a855f7' },
        { name: '百日筑基', icon: '💎', requirement: 100, color: '#8b5cf6' },
    ];
    
    const achievementGrid = document.getElementById('achievementGrid');
    
    achievementGrid.innerHTML = achievements.map(achievement => {
        const unlocked = maxStreak >= achievement.requirement;
        
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : ''}" 
                 style="${!unlocked ? 'opacity: 0.5;' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">连续${achievement.requirement}天</div>
                <div style="margin-top: 8px; font-size: 14px; font-weight: 600;">
                    ${unlocked ? '✓ 已解锁' : '未解锁'}
                </div>
            </div>
        `;
    }).join('');
}

// 显示提示
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 2秒后移除
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderHabits();
    
    // 回车添加习惯
    document.getElementById('habitNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addHabit();
        }
    });
    
    // 点击模态框背景关闭
    document.getElementById('addModal').addEventListener('click', (e) => {
        if (e.target.id === 'addModal') {
            hideAddModal();
        }
    });
});

// 注册 Service Worker (PWA支持)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}


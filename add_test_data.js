// 添加测试数据的脚本
// 在浏览器控制台中运行此脚本

// 清空现有数据（可选）
// localStorage.clear();

// 初始化数据库
const testData = {
    habits: [
        {
            id: 1737561600000,
            name: "晨跑",
            icon: "🏃",
            createdAt: "2026-01-01T06:00:00.000Z"
        },
        {
            id: 1737561700000,
            name: "健身",
            icon: "💪",
            createdAt: "2026-01-05T07:00:00.000Z"
        },
        {
            id: 1737561800000,
            name: "冥想",
            icon: "🧘",
            createdAt: "2026-01-10T08:00:00.000Z"
        },
        {
            id: 1737561900000,
            name: "按时喝水",
            icon: "💧",
            createdAt: "2026-01-15T09:00:00.000Z"
        },
        {
            id: 1737562000000,
            name: "阅读",
            icon: "📚",
            createdAt: "2026-01-08T20:00:00.000Z"
        }
    ],
    records: []
};

// 生成打卡记录
const today = new Date();

// 晨跑 - 坚持了15天（连续）
for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    testData.records.push({
        id: 1737570000000 + i,
        habitId: 1737561600000,
        date: date.toISOString().split('T')[0]
    });
}

// 健身 - 坚持了7天（连续）
for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    testData.records.push({
        id: 1737580000000 + i,
        habitId: 1737561700000,
        date: date.toISOString().split('T')[0]
    });
}

// 冥想 - 坚持了30天（连续）
for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    testData.records.push({
        id: 1737590000000 + i,
        habitId: 1737561800000,
        date: date.toISOString().split('T')[0]
    });
}

// 按时喝水 - 坚持了3天（连续）
for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    testData.records.push({
        id: 1737600000000 + i,
        habitId: 1737561900000,
        date: date.toISOString().split('T')[0]
    });
}

// 阅读 - 坚持了100天（连续，解锁最高成就）
for (let i = 0; i < 100; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    testData.records.push({
        id: 1737610000000 + i,
        habitId: 1737562000000,
        date: date.toISOString().split('T')[0]
    });
}

// 保存到LocalStorage
localStorage.setItem('habitTrackerDB', JSON.stringify(testData));

console.log('✅ 测试数据添加成功！');
console.log('📊 数据统计：');
console.log('- 晨跑：连续15天');
console.log('- 健身：连续7天');
console.log('- 冥想：连续30天');
console.log('- 按时喝水：连续3天');
console.log('- 阅读：连续100天（解锁所有成就）');
console.log('\n刷新页面查看效果！');

// 自动刷新页面
setTimeout(() => {
    location.reload();
}, 1000);


// 游戏数据结构
const gameData = {
    songs: [
        { id: 1, title: 'Be Shine', artist: '未知艺术家' },
        { id: 2, title: '丰睦秋夜', artist: '未知艺术家' },
        { id: 3, title: '代理店长大作战', artist: '未知艺术家' },
        { id: 4, title: '你看 世界好美', artist: '未知艺术家' },
        { id: 5, title: '同沐春风共此时', artist: '未知艺术家' },
        { id: 6, title: '名侦探的试炼', artist: '未知艺术家' },
        { id: 7, title: '夏日竞速嘉年华', artist: '未知艺术家' },
        { id: 8, title: '大艺术家的挑战状', artist: '未知艺术家' },
        { id: 9, title: '幻影之夜', artist: '未知艺术家' },
        { id: 10, title: '惊魂奇妙夜', artist: '未知艺术家' },
        { id: 11, title: '朝露公馆轶闻录', artist: '未知艺术家' },
        { id: 12, title: '沐于春意幻梦求真', artist: '未知艺术家' },
        { id: 13, title: '浪潮翻涌之间', artist: '未知艺术家' },
        { id: 14, title: '深海寻宝环游记', artist: '未知艺术家' },
        { id: 15, title: '深空开拓', artist: '未知艺术家' },
        { id: 16, title: '甜梦游乐园', artist: '未知艺术家' },
        { id: 17, title: '真夏绮想', artist: '未知艺术家' },
        { id: 18, title: '绝对会流行的', artist: '未知艺术家' },
        { id: 19, title: '聆风之召', artist: '未知艺术家' },
        { id: 20, title: '苹安平安同话童话', artist: '未知艺术家' },
        { id: 21, title: '荒野冬日挑战赛', artist: '未知艺术家' },
        { id: 22, title: '金树的乐章', artist: '未知艺术家' },
        { id: 23, title: '风华正当时', artist: '未知艺术家' }
    ],
    currentRoundSongs: [],  // 当前轮次的歌曲
    score: 0,              // 得分
    lives: 5,              // 生命值
    currentAudio: null,    // 当前播放的音频
    isGameActive: false,   // 游戏是否激活
    currentlyPlayingSongId: null, // 当前正在播放的歌曲ID
    currentlyPlayingRecord: null  // 当前正在播放的唱片元素
};

// 切换音乐播放/暂停
function toggleMusicPlayback(songId, recordElement) {
    // 停止当前播放的音频
    if (gameData.currentAudio) {
        gameData.currentAudio.pause();
        gameData.currentAudio = null;
        gameData.currentlyPlayingSongId = null;
        
        // 移除所有唱片的活动状态
        if (gameData.currentlyPlayingRecord) {
            gameData.currentlyPlayingRecord.classList.remove('active');
            gameData.currentlyPlayingRecord = null;
        }
        
        return;
    }
    
    // 查找歌曲信息
    const song = gameData.songs.find(s => s.id === songId);
    if (!song) return;
    
    // 存储当前播放的歌曲ID和唱片元素
    gameData.currentlyPlayingSongId = songId;
    gameData.currentlyPlayingRecord = recordElement;
    
    // 创建音频对象，加载真实的音频文件
    const audioFileName = encodeURIComponent(song.title + '.mp3');
    gameData.currentAudio = new Audio(`audios/${audioFileName}`);
    
    // 设置音频结束事件
    gameData.currentAudio.addEventListener('ended', () => {
        if (gameData.currentAudio) {
            toggleRecordAnimation(recordElement, false);
            gameData.currentAudio = null;
            gameData.currentlyPlayingSongId = null;
            gameData.currentlyPlayingRecord = null;
        }
    });
    
    // 开始播放
    gameData.currentAudio.play().catch(error => {
        console.error('播放音频失败:', error);
        alert('播放音频失败，请刷新页面重试');
        gameData.currentAudio = null;
        gameData.currentlyPlayingSongId = null;
        gameData.currentlyPlayingRecord = null;
    });
    
    // 添加唱片旋转动画
    toggleRecordAnimation(recordElement, true);
}

// 检查答案
function checkAnswer(selectedSongId, buttonElement) {
    // 停止当前播放的音频
    if (gameData.currentAudio) {
        gameData.currentAudio.pause();
        gameData.currentAudio = null;
        
        // 移除所有唱片的活动状态
        if (gameData.currentlyPlayingRecord) {
            gameData.currentlyPlayingRecord.classList.remove('active');
        }
    }
    
    // 检查是否有正在播放的歌曲
    if (gameData.currentlyPlayingSongId === null) {
        alert('请先选择一张唱片播放音乐');
        return;
    }
    
    // 检查答案是否正确
    if (selectedSongId === gameData.currentlyPlayingSongId) {
        // 答案正确
        gameData.score++;
        showAnswerFeedback(buttonElement, true);
        
        // 移除对应的唱片
        const recordElement = document.querySelector(`.record[data-song-id="${gameData.currentlyPlayingSongId}"]`);
        if (recordElement) {
            recordElement.classList.add('fade-out');
            setTimeout(() => {
                recordElement.remove();
            }, 500);
        }
        
        // 从当前轮次中移除这首歌
        gameData.currentRoundSongs = gameData.currentRoundSongs.filter(song => song.id !== gameData.currentlyPlayingSongId);
        
        // 更新剩余歌曲数
        updateSongCountDisplay();
        
        // 清空当前播放状态
        gameData.currentlyPlayingSongId = null;
        gameData.currentlyPlayingRecord = null;
        
        // 检查游戏是否胜利
        if (gameData.currentRoundSongs.length === 0) {
            endGame(true);
        }
    } else {
        // 答案错误
        gameData.lives--;
        showAnswerFeedback(buttonElement, false);
        animateLifeLoss(); // 生命值减少动画
        updateLifeDisplay();
        
        // 清空当前播放状态
        gameData.currentlyPlayingSongId = null;
        gameData.currentlyPlayingRecord = null;
        
        // 检查游戏是否结束
        if (gameData.lives <= 0) {
            endGame(false);
        }
    }
}

// DOM元素引用
const dom = {
    // 页面引用
    screens: {
        start: document.getElementById('startScreen'),
        game: document.getElementById('gameScreen'),
        result: document.getElementById('resultScreen')
    },
    // 按钮引用
    buttons: {
        start: document.getElementById('startBtn'),
        rules: document.getElementById('rulesBtn'),
        closeRules: document.getElementById('closeRulesBtn'),
        exit: document.getElementById('exitBtn'),
        restart: document.getElementById('restartBtn')
    },
    // 容器引用
    containers: {
        recordsGrid: document.getElementById('recordsGrid'),
        songTitlesList: document.getElementById('songTitlesList'),
        rulesModal: document.getElementById('rulesModal'),
        lifeCounter: document.getElementById('lifeCounter'),
        lifeCount: document.getElementById('lifeCount'),
        songCount: document.getElementById('songCount'),
        resultTitle: document.getElementById('resultTitle'),
        resultMessage: document.getElementById('resultMessage'),
        resultContent: document.getElementById('resultContent')
    }
};

// 工具函数
function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

// 动画效果函数
function animateElement(element, animationClass, duration = 0) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration || 1000); // 默认1秒后移除动画类
}

// 生命值变化动画
function animateLifeLoss() {
    if (dom.containers.lifeCounter) {
        dom.containers.lifeCounter.classList.add('lost-life');
        setTimeout(() => {
            dom.containers.lifeCounter.classList.remove('lost-life');
        }, 500);
    }
}

// 答案反馈动画
function showAnswerFeedback(button, isCorrect) {
    if (isCorrect) {
        button.classList.add('correct');
        setTimeout(() => {
            button.classList.add('fade-out');
            setTimeout(() => {
                button.remove();
            }, 500);
        }, 500);
    } else {
        button.classList.add('incorrect');
        setTimeout(() => {
            button.classList.remove('incorrect');
        }, 500);
    }
}

// 唱片旋转动画
function toggleRecordAnimation(recordElement, isPlaying) {
    if (isPlaying) {
        recordElement.classList.add('active');
    } else {
        recordElement.classList.remove('active');
    }
}

// 结果页面动画
function showResultAnimation() {
    if (dom.containers.resultContent) {
        dom.containers.resultContent.classList.add('animated');
    }
}

// 初始化游戏
function initGame() {
    // 初始化游戏状态
    gameData.score = 0;
    gameData.lives = 5;
    gameData.isGameActive = false;
    
    // 更新UI显示
    updateStatusBar();
    
    // 初始化按钮状态
    dom.buttons.exit.disabled = false;
    dom.buttons.exit.style.opacity = '1';
    
    // 清空游戏区域
    dom.containers.recordsGrid.innerHTML = '';
    dom.containers.songTitlesList.innerHTML = '';
    
    // 显示开始屏幕
    showScreen('start');
    
    // 添加事件监听器
    dom.buttons.start.addEventListener('click', startGame);
    dom.buttons.rules.addEventListener('click', showRules);
    dom.buttons.closeRules.addEventListener('click', hideRules);
    dom.buttons.exit.addEventListener('click', exitGame);
    dom.buttons.restart.addEventListener('click', restartGame);
}

// 开始游戏
function startGame() {
    // 重置游戏数据
    gameData.score = 0;
    gameData.lives = 5;
    gameData.isGameActive = true;
    
    // 随机选择歌曲
    gameData.currentRoundSongs = shuffleArray(gameData.songs);
    
    // 更新界面
    updateLifeDisplay();
    updateSongCountDisplay();
    generateRecords();
    generateSongTitles();
    
    // 切换屏幕
    dom.screens.start.classList.add('hidden');
    dom.screens.game.classList.remove('hidden');
    dom.screens.game.classList.add('fade-in');
}

// 生成唱片
function generateRecords() {
    dom.containers.recordsGrid.innerHTML = '';
    
    gameData.currentRoundSongs.forEach(song => {
        const recordElement = document.createElement('div');
        recordElement.className = 'record';
        recordElement.dataset.songId = song.id;
        
        // 使用SVG创建唱片图标
        recordElement.innerHTML = `
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#222" stroke="#333" stroke-width="2"/>
                <circle cx="50" cy="50" r="40" fill="#000"/>
                <circle cx="50" cy="50" r="10" fill="#aaa"/>
                <circle cx="50" cy="50" r="5" fill="#666"/>
                <circle cx="50" cy="50" r="2" fill="#999"/>
                <!-- 细纹 -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="39" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="33" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="27" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="24" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="21" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="18" fill="none" stroke="#444" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="15" fill="none" stroke="#444" stroke-width="0.5"/>
                <!-- 标签 -->
                <circle cx="50" cy="50" r="20" fill="none" stroke="#666" stroke-width="2"/>
            </svg>
        `;
        
        // 绑定点击事件
        recordElement.addEventListener('click', () => toggleMusicPlayback(song.id, recordElement));
        
        dom.containers.recordsGrid.appendChild(recordElement);
    });
}

// 生成歌名选项
function generateSongTitles() {
    dom.containers.songTitlesList.innerHTML = '';
    
    // 打乱所有歌曲的顺序
    const shuffledSongs = shuffleArray(gameData.songs);
    
    shuffledSongs.forEach(song => {
        // 检查这首歌是否在当前轮次中
        const isInCurrentRound = gameData.currentRoundSongs.some(s => s.id === song.id);
        
        if (isInCurrentRound) {
            const button = document.createElement('button');
            button.className = 'song-title-btn';
            button.textContent = song.title;
            button.dataset.songId = song.id;
            
            // 绑定点击事件
            button.addEventListener('click', () => checkAnswer(song.id, button));
            
            dom.containers.songTitlesList.appendChild(button);
        }
    });
}

// 退出游戏
function exitGame() {
    if (confirm('确定要退出游戏吗？当前进度将会丢失。')) {
        // 停止音乐播放
        if (gameData.currentAudio) {
            gameData.currentAudio.pause();
            gameData.currentAudio = null;
        }
        
        // 重置游戏状态
        gameData.isGameActive = false;
        
        // 切换到开始屏幕
        dom.screens.game.classList.add('hidden');
        dom.screens.start.classList.remove('hidden');
    }
}

// 重新开始游戏
function restartGame() {
    // 重置所有界面元素
    dom.containers.resultContent.classList.remove('animated');
    
    // 切换到开始屏幕
    dom.screens.result.classList.add('hidden');
    dom.screens.start.classList.remove('hidden');
}

// 更新生命值显示
function updateLifeDisplay() {
    dom.containers.lifeCount.textContent = gameData.lives;
}

// 更新剩余歌曲数显示
function updateSongCountDisplay() {
    dom.containers.songCount.textContent = gameData.currentRoundSongs.length;
}

// 显示游戏规则
function showRules() {
    dom.containers.rulesModal.classList.remove('hidden');
}

// 隐藏游戏规则
function hideRules() {
    dom.containers.rulesModal.classList.add('hidden');
}

// 结束游戏
function endGame(isVictory) {
    gameData.isGameActive = false;
    
    // 停止音乐播放
    if (gameData.currentAudio) {
        gameData.currentAudio.pause();
        gameData.currentAudio = null;
    }
    
    // 更新结果页面
    if (isVictory) {
        dom.containers.resultTitle.textContent = '恭喜胜利！';
        dom.containers.resultMessage.textContent = `你猜对了所有 ${gameData.score} 首歌曲！`;
    } else {
        dom.containers.resultTitle.textContent = '游戏结束';
        dom.containers.resultMessage.textContent = `你猜对了 ${gameData.score} 首歌曲，再接再厉！`;
    }
    
    // 切换屏幕
    dom.screens.game.classList.add('hidden');
    dom.screens.result.classList.remove('hidden');
    
    // 显示结果动画
    setTimeout(showResultAnimation, 100);
}

// 添加缺失的updateStatusBar函数
function updateStatusBar() {
    updateLifeDisplay();
    updateSongCountDisplay();
}

// 显示屏幕函数
function showScreen(screenName) {
    // 隐藏所有屏幕
    Object.values(dom.screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // 显示指定屏幕
    if (dom.screens[screenName]) {
        dom.screens[screenName].classList.remove('hidden');
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);
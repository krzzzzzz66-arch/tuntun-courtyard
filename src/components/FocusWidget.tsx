import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Play, Plus, Sparkles, Square, Timer, Trash2 } from 'lucide-react';
import { HomeworkTask } from '../types/game';

interface FocusWidgetProps {
  isFocusing: boolean;
  focusModeType: 'countdown' | 'stopwatch';
  focusSeconds: number;
  targetDuration: number;
  homeworkTasks: HomeworkTask[];
  onStartFocus: (mode: 'countdown' | 'stopwatch', durationSec: number) => void;
  onStopFocus: (early: boolean) => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const FocusWidget: React.FC<FocusWidgetProps> = ({
  isFocusing,
  focusModeType,
  focusSeconds,
  targetDuration,
  homeworkTasks,
  onStartFocus,
  onStopFocus,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(25 * 60);
  const [modeTab, setModeTab] = useState<'countdown' | 'stopwatch'>('countdown');
  const [showTasks, setShowTasks] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div className="flex flex-col gap-2 max-w-xs w-full">
      {/* Main Study Focus Card */}
      <div className="bg-slate-900/75 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-xl text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">👓</span>
            <h3 className="font-bold text-sm tracking-wide">
              {isFocusing ? '沉浸陪读专注中...' : '写作业陪读专注'}
            </h3>
          </div>
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 flex items-center gap-1 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>作业便签 ({homeworkTasks.filter((t) => !t.completed).length})</span>
          </button>
        </div>

        {isFocusing ? (
          <div className="flex flex-col items-center py-2">
            <div className="text-3xl font-extrabold font-mono tracking-wider text-amber-300 drop-shadow">
              {focusModeType === 'countdown'
                ? formatTime(Math.max(0, targetDuration - focusSeconds))
                : formatTime(focusSeconds)}
            </div>
            <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              全院动物已戴上小眼镜陪读 · 橡果产出 200%
            </p>
            <div className="flex items-center gap-2 mt-3 w-full">
              {focusModeType === 'stopwatch' && focusSeconds >= 60 ? (
                <button
                  onClick={() => onStopFocus(false)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  完成写作业领盲盒
                </button>
              ) : null}
              <button
                onClick={() => onStopFocus(true)}
                className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white font-semibold text-xs flex items-center justify-center gap-1 transition"
              >
                <Square className="w-3.5 h-3.5" />
                {focusModeType === 'stopwatch' && focusSeconds < 60 ? '结束陪读' : '提前休息'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-xl mb-2.5 text-xs">
              <button
                onClick={() => setModeTab('countdown')}
                className={`py-1 rounded-lg font-medium transition ${
                  modeTab === 'countdown' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                ⏳ 番茄倒计时
              </button>
              <button
                onClick={() => setModeTab('stopwatch')}
                className={`py-1 rounded-lg font-medium transition ${
                  modeTab === 'stopwatch' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                ⏱️ 自由正计时
              </button>
            </div>

            {modeTab === 'countdown' ? (
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {[
                  { label: '15分', sec: 15 * 60 },
                  { label: '25分', sec: 25 * 60 },
                  { label: '45分', sec: 45 * 60 },
                  { label: '⚡10秒体验', sec: 10 },
                ].map((p) => (
                  <button
                    key={p.sec}
                    onClick={() => setSelectedPreset(p.sec)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition ${
                      selectedPreset === p.sec
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                不设时间上限，写作业多久就陪你多久！满 1 分钟即可结算领取学霸盲盒券。
              </p>
            )}

            <button
              onClick={() => onStartFocus(modeTab, selectedPreset)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>开始写作业 · 结束后领【学霸大盲盒】</span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Homework Checklist Mini Drawer */}
      {showTasks && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-xl text-white animate-pop-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> 今日作业小目标（每完成一项 +35🌰）
            </span>
          </div>

          <form onSubmit={handleAdd} className="flex gap-1.5 mb-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="例如：写完数学卷子第1页..."
              className="flex-1 bg-slate-950/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {homeworkTasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-2">
                记下今天要写的作业，勾掉时小动物会放礼花庆祝！
              </p>
            ) : (
              homeworkTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-100'}>
                      {task.text}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

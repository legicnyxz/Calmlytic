import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

const TimerPage = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work')
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = async () => {
    if (!currentSessionId) {
      try {
        const response = await axios.post(`${API_URL}/timer`, {
          session_type: sessionType,
          duration_minutes: sessionType === 'work' ? 25 : 5
        })
        setCurrentSessionId(response.data.id)
      } catch (error: any) {
        toast.error('Failed to start timer session')
        return
      }
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60)
    setCurrentSessionId(null)
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    
    if (currentSessionId) {
      try {
        await axios.put(`${API_URL}/timer/${currentSessionId}/complete`)
        toast.success(`${sessionType === 'work' ? 'Work' : 'Break'} session completed!`)
      } catch (error) {
        console.error('Failed to mark session as complete:', error)
      }
    }

    const nextType = sessionType === 'work' ? 'break' : 'work'
    setSessionType(nextType)
    setTimeLeft(nextType === 'work' ? 25 * 60 : 5 * 60)
    setCurrentSessionId(null)
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${sessionType === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: `Time for a ${nextType === 'work' ? 'work' : 'break'} session.`,
        icon: '/favicon.ico'
      })
    }
  }

  const switchSessionType = (type: 'work' | 'break') => {
    if (isRunning) {
      toast.error('Stop the current session before switching')
      return
    }
    setSessionType(type)
    setTimeLeft(type === 'work' ? 25 * 60 : 5 * 60)
    setCurrentSessionId(null)
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const progress = sessionType === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Focus Timer</h1>
          <p className="text-gray-600 mt-2">
            Use the Pomodoro Technique to boost your productivity and maintain focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Timer className="h-6 w-6" />
                <span>{sessionType === 'work' ? 'Work Session' : 'Break Time'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={sessionType === 'work' ? 'text-blue-600' : 'text-green-600'}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mb-6">
                <Button
                  onClick={isRunning ? pauseTimer : startTimer}
                  size="lg"
                  className={sessionType === 'work' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => switchSessionType('work')}
                  variant={sessionType === 'work' ? 'default' : 'outline'}
                  disabled={isRunning}
                >
                  Work (25 min)
                </Button>
                <Button
                  onClick={() => switchSessionType('break')}
                  variant={sessionType === 'break' ? 'default' : 'outline'}
                  disabled={isRunning}
                >
                  Break (5 min)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                    1
                  </div>
                  <p>Choose a task you want to work on</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                    2
                  </div>
                  <p>Set the timer for 25 minutes and focus</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                    3
                  </div>
                  <p>Take a 5-minute break when the timer rings</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                    4
                  </div>
                  <p>Repeat the cycle to maintain productivity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Improves focus and concentration</p>
                <p>• Reduces mental fatigue</p>
                <p>• Increases productivity</p>
                <p>• Better time management</p>
                <p>• Reduces procrastination</p>
                <p>• Maintains work-life balance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TimerPage

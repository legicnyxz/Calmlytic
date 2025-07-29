import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Wind, 
  Quote, 
  Play, 
  Pause, 
  RotateCcw,
  Heart,
  Sparkles
} from 'lucide-react'
import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

const ResetToolsPage = () => {
  const [quote, setQuote] = useState('')
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathingCount, setBreathingCount] = useState(0)
  const [breathingCycle, setBreathingCycle] = useState(0)

  useEffect(() => {
    fetchQuote()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1
          
          if (breathingPhase === 'inhale' && newCount >= 4) {
            setBreathingPhase('hold')
            return 0
          } else if (breathingPhase === 'hold' && newCount >= 7) {
            setBreathingPhase('exhale')
            return 0
          } else if (breathingPhase === 'exhale' && newCount >= 8) {
            setBreathingPhase('inhale')
            setBreathingCycle(cycle => cycle + 1)
            return 0
          }
          
          return newCount
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [breathingActive, breathingPhase])

  const fetchQuote = async () => {
    try {
      const response = await axios.get(`${API_URL}/quote`)
      setQuote(response.data.quote)
    } catch (error) {
      console.error('Failed to fetch quote:', error)
      setQuote('Take time to breathe and find your center.')
    }
  }

  const startBreathing = () => {
    setBreathingActive(true)
    setBreathingPhase('inhale')
    setBreathingCount(0)
    setBreathingCycle(0)
  }

  const stopBreathing = () => {
    setBreathingActive(false)
    setBreathingPhase('inhale')
    setBreathingCount(0)
  }

  const resetBreathing = () => {
    setBreathingActive(false)
    setBreathingPhase('inhale')
    setBreathingCount(0)
    setBreathingCycle(0)
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe in slowly through your nose'
      case 'hold':
        return 'Hold your breath'
      case 'exhale':
        return 'Exhale slowly through your mouth'
      default:
        return 'Breathe naturally'
    }
  }

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'bg-blue-500'
      case 'hold':
        return 'bg-yellow-500'
      case 'exhale':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Tools</h1>
          <p className="text-gray-600 mt-2">
            Take a moment to reset and recharge with these mindfulness tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Breathing Exercise */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wind className="h-6 w-6 text-blue-600" />
                <span>4-7-8 Breathing Exercise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <div 
                    className={`w-64 h-64 rounded-full ${getBreathingColor()} transition-all duration-1000 flex items-center justify-center ${
                      breathingActive ? 'animate-pulse' : ''
                    }`}
                    style={{
                      transform: breathingActive && breathingPhase === 'inhale' 
                        ? 'scale(1.2)' 
                        : breathingActive && breathingPhase === 'exhale'
                        ? 'scale(0.8)'
                        : 'scale(1)'
                    }}
                  >
                    <div className="text-center text-white">
                      <div className="text-4xl font-bold mb-2">
                        {breathingActive ? breathingCount + 1 : '•'}
                      </div>
                      <div className="text-sm font-medium">
                        {breathingActive ? breathingPhase.toUpperCase() : 'READY'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {getBreathingInstruction()}
                  </p>
                  {breathingActive && (
                    <p className="text-sm text-gray-600">
                      Cycle {breathingCycle + 1} • {breathingPhase} for {
                        breathingPhase === 'inhale' ? 4 - breathingCount :
                        breathingPhase === 'hold' ? 7 - breathingCount :
                        8 - breathingCount
                      } more seconds
                    </p>
                  )}
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    onClick={breathingActive ? stopBreathing : startBreathing}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {breathingActive ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button onClick={resetBreathing} variant="outline" size="lg">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <p>Inhale for 4 seconds → Hold for 7 seconds → Exhale for 8 seconds</p>
                  <p className="mt-1">Repeat 3-4 cycles to reduce stress and anxiety.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Quote */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Quote className="h-6 w-6 text-purple-600" />
                <span>Daily Inspiration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="bg-purple-50 rounded-lg p-6 mb-4">
                  <Quote className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-800 italic leading-relaxed">
                    "{quote}"
                  </p>
                </div>
                <Button onClick={fetchQuote} variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reset Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <span>Quick Reset Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">5-Minute Walk</h4>
                    <p className="text-sm text-gray-600">Step outside and take a short walk to clear your mind.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Hydrate</h4>
                    <p className="text-sm text-gray-600">Drink a glass of water to refresh your body and mind.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Stretch</h4>
                    <p className="text-sm text-gray-600">Do some gentle stretches to release physical tension.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Gratitude</h4>
                    <p className="text-sm text-gray-600">Think of three things you're grateful for today.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Deep Breaths</h4>
                    <p className="text-sm text-gray-600">Take 5 deep breaths to center yourself.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ResetToolsPage

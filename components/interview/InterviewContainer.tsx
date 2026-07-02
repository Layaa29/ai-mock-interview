"use client";

import { useState, useEffect, useRef } from "react";
import { submitAnswerAction, generateFollowUpAction } from "@/app/dashboard/actions";
import { VideoOff, Mic, MicOff, Save, Loader2, ArrowRight, CheckCircle2, ChevronRight, Volume2, Pause, Play, SkipForward, Timer, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  questionText: string;
  orderNumber: number;
}

interface Interview {
  id: string;
  jobRole: string;
  jobExperience: string;
  techStack: string;
  companyName: string | null;
  duration?: number | null;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export default function InterviewContainer({
  interview,
  questions,
  completedQuestionIds,
}: {
  interview: Interview;
  questions: Question[];
  completedQuestionIds: number[];
}) {
  const router = useRouter();
  
  // Setup vs Active states
  const [isSetup, setIsSetup] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Webcam states
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Resume index calculation
  const firstUnansweredIndex = questions.findIndex(q => !completedQuestionIds.includes(q.id));
  const startIndex = firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0;
  
  // Navigation states
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Conversational Follow-up States
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isFollowUpActive, setIsFollowUpActive] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const mainAnswerRef = useRef("");

  // Timers states
  const durationMinutes = interview.duration || 15;
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(durationMinutes * 60);
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);

  // Speech Recognition ref
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Enable/disable webcam
  useEffect(() => {
    let active = true;
    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (active) {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setCameraError("Camera permissions blocked. Proceeding in audio-only simulation.");
        }
      }
    };

    if (isSetup) {
      enableWebcam();
    }

    return () => {
      active = false;
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetup]);

  // Timers triggers
  useEffect(() => {
    if (isSetup || isPaused || submitting) return;

    const timer = setInterval(() => {
      // 1. Total Interview Countdown
      setInterviewTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time's up! Submitting your current progress...");
          router.push(`/dashboard/interview/${interview.id}/feedback`);
          return 0;
        }
        return prev - 1;
      });

      // 2. Current Question timer count up
      setQuestionTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSetup, isPaused, submitting, interview.id, router]);

  // Speech recognition bind
  useEffect(() => {
    const SpeechRecognition = (
      (window as unknown as Record<string, unknown>).SpeechRecognition || 
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    ) as unknown as new () => ISpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (e: ISpeechRecognitionEvent) => {
        let finalTrans = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTrans += e.results[i][0].transcript + " ";
          }
        }
        if (finalTrans) {
          setUserAnswer((prev) => prev + finalTrans);
        }
      };

      rec.onerror = (e: { error: string }) => {
        console.error("Speech error:", e.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice speech-to-text is not supported by your browser. Please type your answer.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Format seconds to MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit Answer (with Conversational Follow-Up question logic)
  const handleSaveAndNext = async () => {
    if (!userAnswer.trim()) {
      alert("Please record or type your response before saving.");
      return;
    }

    // Stop recording
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Stage 1: Trigger follow-up if not active yet
    if (!isFollowUpActive) {
      setLoadingFollowUp(true);
      try {
        const followUpText = await generateFollowUpAction(currentQuestion.questionText, userAnswer);
        mainAnswerRef.current = userAnswer;
        setUserAnswer("");
        setFollowUpQuestion(followUpText);
        setIsFollowUpActive(true);
        setQuestionTimeSpent(0); // Reset timer for follow-up
      } catch (err) {
        console.error("Failed to generate follow-up, shifting to next question", err);
        // Fallback: save single answer immediately
        await saveAnswerToDb(userAnswer);
      } finally {
        setLoadingFollowUp(false);
      }
    } else {
      // Stage 2: Combine main answer and follow-up answer
      const combinedAnswer = `[Initial Question Answer]: ${mainAnswerRef.current}\n\n[Interviewer Follow-up Question]: ${followUpQuestion}\n[Follow-up Answer]: ${userAnswer}`;
      await saveAnswerToDb(combinedAnswer);
    }
  };

  const saveAnswerToDb = async (answerText: string) => {
    setSubmitting(true);
    try {
      await submitAnswerAction(interview.id, currentQuestion.id, answerText);
      setUserAnswer("");
      setIsFollowUpActive(false);
      setFollowUpQuestion("");
      setQuestionTimeSpent(0);

      if (isLastQuestion) {
        if (webcamStream) {
          webcamStream.getTracks().forEach((track) => track.stop());
        }
        router.push(`/dashboard/interview/${interview.id}/feedback`);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit response. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Skip question action
  const handleSkipQuestion = async () => {
    if (confirm("Are you sure you want to skip this question? You will receive 0 rating points for this question.")) {
      setSubmitting(true);
      try {
        const placeholderAnswer = "Candidate skipped this question.";
        await submitAnswerAction(interview.id, currentQuestion.id, placeholderAnswer);
        
        setUserAnswer("");
        setIsFollowUpActive(false);
        setFollowUpQuestion("");
        setQuestionTimeSpent(0);

        if (isLastQuestion) {
          if (webcamStream) {
            webcamStream.getTracks().forEach((track) => track.stop());
          }
          router.push(`/dashboard/interview/${interview.id}/feedback`);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to skip question.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const startInterview = () => {
    setIsSetup(false);
    setTimeout(() => {
      if (videoRef.current && webcamStream) {
        videoRef.current.srcObject = webcamStream;
      }
    }, 100);
  };

  // Toggle Pause
  const togglePause = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setIsPaused(!isPaused);
  };

  if (isSetup) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black text-white">Let&apos;s check your setup</h1>
          <p className="text-slate-400 text-sm">
            Make sure your webcam works and you&apos;re in a quiet environment. We will simulate a video call.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left info panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">INTERVIEW SPECIFICS</span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{interview.jobRole}</h3>
                <p className="text-xs text-slate-500 mt-1">Experience: {interview.jobExperience}</p>
              </div>

              <div className="space-y-3 border-t border-slate-850 pt-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    This interview contains <strong>{questions.length} questions</strong> generated specifically for: <em>{interview.techStack}</em>.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Each question will include a **Gemini AI follow-up prompt** to test your implementation trade-offs conversationally.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Timer className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Session duration limit configured at: <strong>{durationMinutes} minutes</strong>.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Practice Session
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Right webcam preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[350px] relative overflow-hidden">
            {webcamStream ? (
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 aspect-video relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-350 font-bold border border-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Preview
                </span>
              </div>
            ) : (
              <div className="text-center p-6 space-y-4">
                {cameraError ? (
                  <div className="space-y-2">
                    <VideoOff className="h-10 w-10 text-amber-500 mx-auto" />
                    <p className="text-xs text-slate-400 font-semibold">{cameraError}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Initializing camera feed...</p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    try {
                      setCameraError("");
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480 },
                        audio: false,
                      });
                      setWebcamStream(stream);
                      if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                      }
                    } catch (err) {
                      console.error(err);
                      setCameraError("Camera capture blocked. Running without video preview.");
                    }
                  }}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs rounded-xl font-bold text-slate-350 transition"
                >
                  Retry Camera Device
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-8 select-none border border-slate-800">
          <Pause className="h-12 w-12 text-indigo-400 animate-pulse mb-4" />
          <h2 className="text-2xl font-black text-white">Interview Session Paused</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            Timers are frozen. Grab some water and resume when you are ready to continue your evaluation.
          </p>
          <button
            onClick={togglePause}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Resume Interview
          </button>
        </div>
      )}

      {/* Progress & Header details */}
      <div className="space-y-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/20 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              Remaining: {formatTime(interviewTimeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Pause Trigger */}
            <button
              onClick={togglePause}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850 relative">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + (isFollowUpActive ? 0.5 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Question Details & Answer Input */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            
            {loadingFollowUp ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-350">Interviewer is formulating a follow-up...</span>
              </div>
            ) : isFollowUpActive ? (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  INTERVIEWER FOLLOW-UP
                </span>
                <h2 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
                  {followUpQuestion}
                </h2>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">INITIAL QUESTION</span>
                <h2 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
                  {currentQuestion?.questionText}
                </h2>
              </div>
            )}
          </div>

          {/* Answer Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                RESPONSE TEXT
                <span className="text-slate-600">({formatTime(questionTimeSpent)} spent)</span>
              </span>
              <button
                type="button"
                onClick={toggleRecording}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Voice
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Transcribe Voice
                  </>
                )}
              </button>
            </div>

            {/* Answer editing textarea */}
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                isFollowUpActive
                  ? "Respond to the interviewer's follow-up question here..."
                  : "Record your response using the voice transcriber or type your answer directly here..."
              }
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-650 outline-none resize-y transition"
            />

            {/* live speech transcript viewer block */}
            {isRecording && (
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Live Transcript Stream</span>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {userAnswer ? userAnswer : "Listening for voice input..."}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              {/* Skip question option */}
              <button
                onClick={handleSkipQuestion}
                disabled={submitting || isFollowUpActive}
                className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <SkipForward className="h-4 w-4" />
                Skip Question
              </button>

              <button
                onClick={handleSaveAndNext}
                disabled={submitting || loadingFollowUp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Evaluating...
                  </>
                ) : isFollowUpActive ? (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Submit Follow-up
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Save & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Camera/Simulation Panel */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden aspect-video">
            {webcamStream ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl bg-slate-950" />
            ) : (
              <div className="text-center p-6 text-slate-500 space-y-2">
                <VideoOff className="h-10 w-10 mx-auto text-slate-700" />
                <p className="text-xs">Camera preview disabled</p>
              </div>
            )}
            <div className="absolute bottom-8 left-8 bg-slate-950/80 backdrop-blur-sm border border-slate-850 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              {webcamStream ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Candidate Feed Active
                </>
              ) : (
                "Simulation Mode"
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex items-start gap-4">
            <ChevronRight className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">AI Conversation Follow-Up</h4>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                After you submit your initial answer, the AI interviewer will ask a custom follow-up question to test your implementation details. This simulates a real conversational round at top companies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

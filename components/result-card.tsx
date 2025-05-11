import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, X, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { statusToDisplay } from "@/types/admin"

interface ResultCardProps {
  candidate: {
    firstName: string
    lastName: string
    interviewRefNo?: string
    major?: string
    majorName?: string
    passed: boolean
    status?: "not_started" | "qualified" | "not_qualified"
    interviewTime?: string
    interviewFormat?: "online" | "onsite"
  }
}

export default function ResultCard({ candidate }: ResultCardProps) {
  const { firstName, lastName, interviewRefNo, major, majorName, passed, status, interviewTime, interviewFormat } =
    candidate

  // Determine status display
  const getStatusDisplay = () => {
    if (passed) {
      return {
        title: "ผ่านเข้ารอบสัมภาษณ์",
        description: "ขอแสดงความยินดีกับ",
        color: "text-green-400",
        icon: <Sparkles className="h-5 w-5 text-orange-400" />,
      }
    } else {
      return {
        title: "ไม่ผ่านเข้ารอบสัมภาษณ์",
        description: "ขอขอบคุณที่ร่วมสมัคร",
        color: "text-red-400",
        icon: <X className="h-5 w-5 text-red-400" />,
      }
    }
  }

  // Get interview status icon
  const getInterviewStatusIcon = (status?: string) => {
    if (!status) return <Clock className="h-5 w-5 text-gray-400" />

    switch (status) {
      case "qualified":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "not_qualified":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  // Get interview status color
  const getInterviewStatusColor = (status?: string) => {
    if (!status) return "text-gray-400"

    switch (status) {
      case "qualified":
        return "text-green-400"
      case "not_qualified":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <Card className="w-full max-w-md mx-auto bg-black border-red-900 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 p-1"></div>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-red-900/50 mb-4 flex items-center justify-center border-2 border-red-500">
            <span className="text-2xl font-bold">
              {firstName?.charAt(0)}
              {lastName?.charAt(0)}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-300">{statusDisplay.description}</h3>
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mt-1">
              คุณ {firstName} {lastName}
              {statusDisplay.icon}
            </h2>
          </div>

          <div className="bg-red-900/30 rounded-lg p-4 w-full mb-4">
            {passed ? (
              <>
                <p className="text-sm text-gray-300 mb-1">เลขประจำตัวผู้เข้าสัมภาษณ์: {interviewRefNo}</p>
                <p className="text-sm text-gray-300 mb-1">
                  สาขา: <span className="font-medium">{majorName || major}</span>
                </p>
                {interviewTime && (
                  <p className="text-sm text-gray-300 mb-1">
                    เวลาสัมภาษณ์: <span className="font-medium">{interviewTime}</span>
                  </p>
                )}
                {interviewFormat && (
                  <p className="text-sm text-gray-300 mb-1">
                    รูปแบบการสัมภาษณ์:{" "}
                    <span className="font-medium">{interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"}</span>
                  </p>
                )}
                {status && (
                  <p
                    className={`text-sm mb-3 flex items-center justify-center gap-1 ${getInterviewStatusColor(status)}`}
                  >
                    {getInterviewStatusIcon(status)}
                    <span className="font-medium">{statusToDisplay[status]}</span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-300 mb-1">ขอบคุณสำหรับความสนใจในค่าย Young Webmaster Camp ครั้งที่ 20</p>
            )}
            <p className={`text-lg font-bold mt-3 flex items-center justify-center gap-2 ${statusDisplay.color}`}>
              {statusDisplay.title}
            </p>
          </div>

          {passed && (
            <div className="space-y-3 w-full">
              <Link
                href={`https://ywc20.ywc.in.th/interview/${major?.replace("web_", "") || "programming"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  รายละเอียดการสัมภาษณ์
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

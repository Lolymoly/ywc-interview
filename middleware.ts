import { type NextRequest, NextResponse } from "next/server"

// กำหนด credentials สำหรับ Basic Auth
const ADMIN_USERNAME = "master"
const ADMIN_PASSWORD = "1234"

// ฟังก์ชันสำหรับตรวจสอบ Basic Auth
export function middleware(request: NextRequest) {
  // ตรวจสอบเฉพาะเส้นทางที่เริ่มต้นด้วย /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // ดึง Authorization header
    const authHeader = request.headers.get("authorization")

    if (authHeader) {
      // ตรวจสอบรูปแบบ Basic Auth
      const authValue = authHeader.split(" ")[1]
      const [user, password] = atob(authValue).split(":")

      // ตรวจสอบ credentials
      if (user === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // ถ้า credentials ถูกต้อง อนุญาตให้เข้าถึงหน้า admin
        return NextResponse.next()
      }
    }

    // ถ้า credentials ไม่ถูกต้องหรือไม่มี Authorization header
    // ส่ง response กลับไปขอ credentials
    const response = new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="YWC20 Admin Panel"',
      },
    })

    return response
  }

  // สำหรับเส้นทางอื่นๆ ที่ไม่ใช่ /admin ให้เข้าถึงได้ตามปกติ
  return NextResponse.next()
}

// กำหนดให้ middleware ทำงานเฉพาะกับ path ที่เริ่มต้นด้วย /admin
export const config = {
  matcher: ["/admin/:path*"],
}

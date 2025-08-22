# ระบบการแจ้งเตือนแบบ Real-time

ระบบการแจ้งเตือนนี้ใช้ WebSocket เพื่อส่งการแจ้งเตือนแบบ real-time ไปยังผู้ใช้ โดยเฉพาะสำหรับการเชิญเข้าร่วม workspace

## ฟีเจอร์หลัก

### 1. การแจ้งเตือนแบบ Real-time
- ใช้ WebSocket สำหรับการส่งข้อมูลแบบ real-time
- แสดงการแจ้งเตือนทันทีเมื่อมีการเชิญเข้าร่วม workspace
- Badge แสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน

### 2. การจัดการการแจ้งเตือน
- กดอ่านการแจ้งเตือนแต่ละรายการ
- ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
- แสดงสถานะการอ่าน/ยังไม่ได้อ่าน

### 3. การตอบสนองต่อการแจ้งเตือน
- ปุ่ม "ยอมรับ" และ "ปฏิเสธ" สำหรับ workspace invitations
- การประมวลผลแบบ real-time
- Redirect ไปยัง workspace เมื่อยอมรับ

## โครงสร้างไฟล์

```
src/
├── app/api/
│   ├── notifications/
│   │   ├── ws/route.ts          # WebSocket endpoint
│   │   ├── route.ts             # REST API for notifications
│   │   └── actions/route.ts     # Handle notification actions
│   └── workspaces/[workspaceId]/invites/route.ts  # Updated to send notifications
├── hooks/
│   └── use-notifications.ts     # Custom hook for notifications
├── providers/
│   └── notification-provider.tsx # Global notification provider
└── components/
    └── navbar.tsx               # Updated with notification UI
```

## การใช้งาน

### 1. การส่งการแจ้งเตือน

เมื่อมีการเชิญเข้าร่วม workspace ระบบจะ:

```typescript
// สร้าง notification ใน database
const notification = await prisma.notification.create({
    data: {
        type: 'WORKSPACE_INVITE',
        userId: invitedUser.id,
        title: `You've been invited to join ${workspace.name}`,
        content: `${workspace.owner.name} has invited you to join their workspace as ${role.toLowerCase()}.`,
        data: {
            invitationId: invitation.id,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            inviterName: workspace.owner.name,
            role: role,
            actions: ['accept', 'reject']
        }
    }
})

// ส่งผ่าน WebSocket
await sendNotificationToUser(invitedUser.id, notification)
```

### 2. การรับการแจ้งเตือน

```typescript
// ใช้ hook ใน component
const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    handleAction 
} = useNotifications()
```

### 3. การตอบสนองต่อการแจ้งเตือน

```typescript
// ยอมรับ invitation
await handleAction(notificationId, 'accept')

// ปฏิเสธ invitation
await handleAction(notificationId, 'reject')
```

## WebSocket Protocol

### Messages จาก Server

```typescript
// Unread count update
{
    type: 'UNREAD_COUNT',
    count: number
}

// New notification
{
    type: 'NEW_NOTIFICATION',
    notification: {
        id: string,
        type: string,
        title: string,
        content: string,
        isRead: boolean,
        data?: any,
        createdAt: string
    }
}

// Notifications list
{
    type: 'NOTIFICATIONS',
    notifications: Notification[]
}
```

### Messages จาก Client

```typescript
// Mark as read
{
    type: 'MARK_AS_READ',
    notificationId: string
}

// Mark all as read
{
    type: 'MARK_ALL_AS_READ'
}

// Get notifications
{
    type: 'GET_NOTIFICATIONS'
}
```

## Database Schema

```prisma
model Notification {
    id        String   @id @default(uuid())
    type      String   // MENTION, ASSIGNMENT, WORKSPACE_INVITE, etc.
    userId    String
    title     String
    content   String
    isRead    Boolean  @default(false)
    data      Json?    // Additional data like invitationId, action buttons, etc.
    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id])

    @@index([userId])
    @@index([isRead])
    @@index([createdAt])
    @@index([type])
}
```

## การตั้งค่า

### 1. Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Email (for invitations)
RESEND_API_KEY="your_resend_api_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Dependencies

```json
{
    "dependencies": {
        "hono": "^3.x.x",
        "@prisma/client": "^6.x.x",
        "sonner": "^1.x.x"
    }
}
```

## การทดสอบ

### 1. ทดสอบการส่งการแจ้งเตือน

1. เข้าสู่ระบบด้วย user account
2. ไปที่ workspace และเชิญ user อื่น
3. ตรวจสอบว่าการแจ้งเตือนปรากฏใน navbar ของ user ที่ถูกเชิญ

### 2. ทดสอบการตอบสนอง

1. กดปุ่ม "ยอมรับ" ใน notification
2. ตรวจสอบว่าถูกเพิ่มเข้า workspace
3. ตรวจสอบว่า notification ถูกทำเครื่องหมายว่าอ่านแล้ว

### 3. ทดสอบ WebSocket Connection

1. เปิด Developer Tools
2. ดู Console logs สำหรับ WebSocket connection
3. ทดสอบการ reconnect เมื่อ disconnect

## การแก้ไขปัญหา

### 1. WebSocket ไม่เชื่อมต่อ

- ตรวจสอบว่า server รันอยู่
- ตรวจสอบ CORS settings
- ตรวจสอบ authentication middleware

### 2. การแจ้งเตือนไม่ปรากฏ

- ตรวจสอบ database connection
- ตรวจสอบ user authentication
- ตรวจสอบ WebSocket message format

### 3. Action buttons ไม่ทำงาน

- ตรวจสอบ API endpoint
- ตรวจสอบ notification data structure
- ตรวจสอบ user permissions

## การขยายฟีเจอร์

### 1. เพิ่มประเภทการแจ้งเตือน

```typescript
// เพิ่มใน switch case
case 'TASK_ASSIGNED':
    return await handleTaskAssignmentAction(c, notification, action, userId)
```

### 2. เพิ่มการแจ้งเตือนแบบ Push

```typescript
// ใช้ Service Worker สำหรับ push notifications
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
}
```

### 3. เพิ่มการแจ้งเตือนแบบ Email

```typescript
// ส่ง email notification พร้อมกับ WebSocket
await sendEmailNotification(user.email, notification)
```

## Best Practices

1. **Error Handling**: จัดการ error ทั้งใน WebSocket และ REST API
2. **Reconnection**: ใช้ exponential backoff สำหรับการ reconnect
3. **Rate Limiting**: จำกัดการส่งการแจ้งเตือนเพื่อป้องกัน spam
4. **Security**: ตรวจสอบ authentication และ authorization ทุกครั้ง
5. **Performance**: ใช้ pagination สำหรับการแจ้งเตือนจำนวนมาก
6. **Accessibility**: รองรับ screen readers และ keyboard navigation

# Grade Management System

Source code: [Github](https://github.com/facebook/create-react-app)

## Miêu tả hệ thống

### `1.Chức năng chính:`

**1. Yêu cầu**

- Phân quyền routes (người dùng, học viên, giảng viên, admin).
- Social Login (google, facebook).

**2. Chức năng chính:**
| Vai trò | Trang chính | Học viên | Giảng viên | Admin |
| --------- | ---------------------------- | ---------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Chức năng | 1. Hệ thống trang chính<br>2. Đăng nhập | 1. Quản lý trang cá nhân<br> 2. Lớp học tham gia | 1. Quản lý trang cá nhân<br>2. Quản lý lớp học | 1. Quản lý tài khoản<br>2. Quản lý lớp học |

### `2.Routes:`

- **Trang chính:**
  - /home
  - /login
- **Trang học viên:**

  /student

  1. Xem thông tin cá nhân
      - /student/my_info
      - /student/my_info/update
      - /student/scored_record
  2. Xem lớp học đã tham gia
      - /student/courses
      - /student/courses/invitation_code
      - /student/courses/id

- **Trang giảng viên:**

  /teacher

  1. Xem thông tin cá nhân
      - /teacher/my_info
      - /teacher/my_info/update
  2. Xem lớp học đang quản lý
     - /teacher/courses
     - /teacher/courses/invatitation_create
     - /teacher/courses/id

- **Trang admin:**

  /admin

  1. Xem thông tin cá nhân
      - /admin/my_info
      - /admin/my_info/update
  2. Quản lý tài khoản
      - /admin/accounts
  3. Quản lý lớp học
      - /admin/courses

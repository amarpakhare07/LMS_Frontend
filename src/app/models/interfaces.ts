import { Course } from "./course.model";

// src/app/models/interfaces.ts
export interface User {
  userId: number;
  name: string;
  email: string;
  bio: string | null;
  profilePicture: string | null;
  lastLogin: string;
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;
}


// export interface Course {
//   courseID: number;
//   title: string;
//   description: string;
//   syllabus: string;
//   level: string;
//   language: string;
//   duration: number;
//   thumbnailURL: string;
//   categoryID: number;
//   published: boolean;
//   rating: number;
//   reviewCount: number;
// }

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  roles: {
    [key: string]: number; // e.g., { Admin: 5, Instructor: 10 }
  };
}

// export interface Course {
//   courseID: number;
//   title: string;
//   description: string;
//   syllabus: string;
//   level: string;
//   language: string;
//   duration: number;
//   thumbnailURL: string;
//   categoryID: number;
//   published: boolean;
//   rating: number;
//   reviewCount: number;
// }


export interface Category {
  categoryID: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  courses: Course[] | null;
}



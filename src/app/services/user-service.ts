// src/app/services/user-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 
import { environment } from '../../environment'; 

import { UserProfile } from '../models/interfaces'; 

// Define the API response structure for the photo, 
export interface UserPhotoResponse { 
  photoURL: string | null; // Renamed for consistency with component usage
}

// Interface for the PUT request body to update the main profile data
export interface UpdateProfileRequest {
  name: string;
  bio: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 
  // Base URL for 'me' endpoints, commonly used for the logged-in user's profile
  private userManagementBaseUrl = `${this.apiUrl}/UserManagement/me`; 

  getUserProfile(): Observable<UserProfile> {
    // Expected to return UserProfile: { name, bio, email, profilePicture }
    return this.http.get<UserProfile>(this.userManagementBaseUrl);
  }


  updateUserProfile(profile: UserProfile): Observable<UserProfile> {
    // Only send the fields that can be updated
    const updateRequest: UpdateProfileRequest = {
      name: profile.name,
      bio: profile.bio
    };
    return this.http.put<UserProfile>(`${this.userManagementBaseUrl}/bio`, updateRequest);
  }



public staticImageBaseUrl = 'http://localhost:7049/images/'; 
  

  getUserPhoto(): Observable<UserPhotoResponse> {
    return this.http.get<UserProfile>(this.userManagementBaseUrl).pipe(
      map(profile => ({
        
        photoURL: profile.profilePicture 
          ? `${this.staticImageBaseUrl}${profile.profilePicture}` // e.g., http://localhost:7049/images/nigt.png
          : null
      }))
    );
  }

 
  uploadUserPhoto(file: File): Observable<string> {
    const formData = new FormData();
    // 'file' must match the parameter name (IFormFile file) in the backend controller.
    formData.append('file', file, file.name);

    return this.http.post<{ FileName: string; Message: string }>(
      `${this.userManagementBaseUrl}/profilePicture`,
      formData
    ).pipe(
      // Maps the backend response object to return only the file name/path string
      map(res => res.FileName) 
    );
  }


  deleteUserPhoto(): Observable<any> {
    return this.http.delete(`${this.userManagementBaseUrl}/profilePicture`);
  }
}



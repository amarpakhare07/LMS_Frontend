



import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopInstructorDto } from '../../../models/student.model';

@Component({
    selector: 'app-top-instructors',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, DecimalPipe],
   templateUrl: './top-instructor.html',
    styleUrl: './top-instructor.css'
})

export class TopInstructorsComponent {
    // 🟢 Input property to receive the data
    @Input() instructors: TopInstructorDto[] = []; 
    // 🟢 Input property to handle loading state
    @Input() isLoading: boolean = true; 

    // NOTE: This URL should ideally be in an environment file
    private staticImageBaseUrl = 'https://localhost:7049/Uploads/'; 
    // ❌ REMOVED: private defaultProfile = '...'; 

    /** * Returns the full URL for the profile picture or a default placeholder using the first initial.
     * The method now accepts the whole instructor DTO.
     */
    getInstructorProfile(instructor: TopInstructorDto): string {

        console.log('Instructor Data:', instructor);

        const fileName = instructor.profilePicture;
        
        // 1. If a profile picture filename is provided, use the full image URL.
        if (fileName) {
            return `${this.staticImageBaseUrl}${fileName}`;
        }
        
        // 2. If no profile picture, use the first letter of the name for a dynamic placeholder.
        const firstInitial = instructor.name.charAt(0).toUpperCase();
        // Using a color consistent with the dashboard's blue/primary color scheme (#4e79a7 from ApexCharts)
        return `https://placehold.co/50x50/4e79a7/ffffff?text=${firstInitial}`; 
    }

    /** * Handles image loading errors by falling back to the initial-based placeholder.
     */
    onImageError(event: Event, instructorName: string): void {
        const firstInitial = instructorName.charAt(0).toUpperCase();
        // Fallback placeholder URL
        const dynamicPlaceholder = `https://placehold.co/50x50/4e79a7/ffffff?text=${firstInitial}`;
        (event.target as HTMLImageElement).src = dynamicPlaceholder;
    }
}
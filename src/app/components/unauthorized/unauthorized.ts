import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  // Import RouterLink to make [routerLink]="'/'" work in the template
  imports: [RouterLink], 
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.css']
})
export class Unauthorized {

  constructor() {
    // You could potentially inject a service here to log
    // this unauthorized access attempt.
  }

}
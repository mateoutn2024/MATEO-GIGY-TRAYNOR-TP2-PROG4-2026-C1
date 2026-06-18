import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  userProfile: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userProfile = user;
      } else {
        this.userProfile = {
          firstName: 'Mateo',
          lastName: 'UTN',
          email: 'mateo@utn.edu.ar',
          username: 'mateoutn',
          birthDate: '2000-01-01',
          description: 'Estudiante de programación y entusiasta del desarrollo de aplicaciones.',
          avatarUrl: 'https://via.placeholder.com/150',
          role: 'usuario'
        };
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { MatDialog } from '@angular/material/dialog';
import { AddChallengeComponent } from '../add-challenge/add-challenge.component';
import { EditChallengeComponent } from '../edit-challenge/edit-challenge.component';

@Component({
  selector: 'app-my-challenges',
  templateUrl: './my-challenges.component.html',
  styleUrls: ['./my-challenges.component.scss']
})
export class MyChallengesComponent implements OnInit {
  challenges: any[] = [];
  filteredChallenges: any[] = [];
  paginatedChallenges: any[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  
  // Filters
  searchTerm = '';
  selectedDifficulty = '';
  difficultyOptions = ['Easy', 'Medium', 'Hard'];

  constructor(
    private challengeService: ChallengeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.loading = true;
    this.error = null;
    this.challengeService.getAllChallenges().subscribe({
      next: (challenges) => {
        this.challenges = challenges;
        this.filteredChallenges = [...challenges];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load challenges';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    
    this.filteredChallenges = this.challenges.filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          challenge.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDifficulty = !this.selectedDifficulty || 
                              challenge.difficulty === this.selectedDifficulty;
      
      return matchesSearch && matchesDifficulty;
    });
    
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredChallenges.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedChallenges = this.filteredChallenges.slice(startIndex, endIndex);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  openAddChallengeDialog(): void {
    const dialogRef = this.dialog.open(AddChallengeComponent, {
      width: '900px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadChallenges();
      }
    });
  }

  openEditDialog(challenge: any): void {
    const dialogRef = this.dialog.open(EditChallengeComponent, {
      width: '900px',
      data: { challenge }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadChallenges();
      }
    });
  }

  deleteChallenge(challengeId: string): void {
    if (confirm('Are you sure you want to delete this challenge?')) {
      this.challengeService.deleteChallenge(challengeId).subscribe({
        next: () => {
          this.loadChallenges();
        },
        error: (err) => {
          console.error('Error deleting challenge', err);
          this.error = 'Failed to delete challenge';
        }
      });
    }
  }
}
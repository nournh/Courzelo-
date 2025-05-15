import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-program-stats-modal',
  templateUrl: './program-stats-moda.component.html',
  styleUrls: ['./program-stats-moda.component.scss']
})
export class ProgramStatsModalComponent implements OnInit {
  @Input() stats: any;
  @Input() program: any;
  @Input() loading: boolean = false;

  displayStats: any; // Stats transformées pour l'affichage

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.prepareStatsForDisplay();
  }

  private prepareStatsForDisplay(): void {
    if (!this.stats) {
      this.displayStats = this.createEmptyStats();
      return;
    }

    // Copie profonde des stats
    this.displayStats = JSON.parse(JSON.stringify(this.stats));

    // Calcul des pourcentages par module
    if (this.displayStats.modules) {
      this.displayStats.modules.forEach(module => {
        module.percentage = this.calculateModulePercentage(module);
        
        // Vérification et initialisation des propriétés
        module.completedCourses = module.completedCourses || 0;
        module.totalCourses = module.totalCourses || 0;
        
        // Calcul des cours restants si non fournis
        if (module.remainingCourses === undefined) {
          module.remainingCourses = module.totalCourses - module.completedCourses;
        }
      });
    }

    // Calcul du pourcentage global si non fourni
    if (this.displayStats.completionPercentage === undefined) {
      const totalCourses = this.displayStats.modules?.reduce((sum, m) => sum + (m.totalCourses || 0), 0) || 0;
      const completedCourses = this.displayStats.modules?.reduce((sum, m) => sum + (m.completedCourses || 0), 0) || 0;
      
      this.displayStats.completionPercentage = totalCourses > 0 
        ? Math.round((completedCourses / totalCourses) * 100) 
        : 0;
    }
  }

  private calculateModulePercentage(module: any): number {
    if (!module || !module.totalCourses || module.totalCourses === 0) return 0;
    return Math.round((module.completedCourses / module.totalCourses) * 100);
  }

  private createEmptyStats() {
    return {
      completionPercentage: 0,
      completedCourses: 0,
      totalCourses: 0,
      remainingCourses: 0,
      modules: [],
      isEmpty: true
    };
  }

  getProgressClass(percentage: number): string {
    if (percentage === undefined || percentage === null) return 'bg-secondary';
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}
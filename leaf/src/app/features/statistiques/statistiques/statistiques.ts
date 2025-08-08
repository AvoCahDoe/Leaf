

// src/app/features/statistiques/statistiques.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ChangeDetectorRef } from '@angular/core';
import { Marker } from '../../../core/models/marker.model';
import { MarkerService } from '../../../core/services/marker.service';

Chart.register(...registerables);
@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective // Important
  ],
  templateUrl: './statistiques.html',
  styleUrls: ['./statistiques.scss']
})
export class StatistiquesComponent implements OnInit {

  private markerService = inject(MarkerService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  error: string | null = null;
  markers: Marker[] = [];

  // Statistiques calculées
  totalMarkers = 0;
  avgEmployees: number | null = null;
  totalTurnover: number | null = null; // Somme des chiffres d'affaires
  formDistribution: { [key: string]: number } = {};
  cityDistribution: { [key: string]: number } = {};
  // Vous pouvez ajouter d'autres stats ici (min/max clients actifs, etc.)

  // --- Graphiques ---

  // 1. Camembert: Répartition par Forme Juridique
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)', // Bleu
        'rgba(255, 206, 86, 0.8)',  // Jaune
        'rgba(255, 99, 132, 0.8)',  // Rouge
        'rgba(75, 192, 192, 0.8)',  // Vert
        'rgba(153, 102, 255, 0.8)', // Violet
        'rgba(255, 159, 64, 0.8)'   // Orange
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  // 2. Histogramme: Top 10 Villes
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: false } }, // Afficher tous les labels
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Marqueurs: ${context.parsed.y}`;
          }
        }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre de Marqueurs',
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };


  ngOnInit(): void {
    this.loadMarkers();
  }

  private loadMarkers(): void {
    this.isLoading = true;
        this.cdr.detectChanges();

    this.error = null;

    this.markerService.getMarkers().subscribe({
      next: (data) => {
        this.markers = data;
        this.calculateStats();
        this.updateChartData();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('StatistiquesComponent: Error loading markers', err);
        this.error = 'Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateStats(): void {
    this.totalMarkers = this.markers.length;

    // Calculer le nombre moyen d'employés
    const employeeCounts = this.markers
      .map(m => m.nombreEmployes)
      .filter((val): val is number => val !== undefined && val !== null);
    this.avgEmployees = employeeCounts.length > 0 ? employeeCounts.reduce((a, b) => a + b, 0) / employeeCounts.length : null;

    // Calculer le chiffre d'affaires total
    const turnovers = this.markers
      .map(m => m.chiffreAffaires)
      .filter((val): val is number => val !== undefined && val !== null);
    this.totalTurnover = turnovers.length > 0 ? turnovers.reduce((a, b) => a + b, 0) : null;

    // Répartition par forme juridique
    this.formDistribution = {};
    this.markers.forEach(marker => {
      const form = marker.form || 'Non spécifiée';
      this.formDistribution[form] = (this.formDistribution[form] || 0) + 1;
    });

    // Répartition par ville
    this.cityDistribution = {};
    this.markers.forEach(marker => {
      const city = marker.city || 'Ville non spécifiée';
      this.cityDistribution[city] = (this.cityDistribution[city] || 0) + 1;
    });
  }

  private updateChartData(): void {
    // Mise à jour du camembert (Forme Juridique)
    const formLabels = Object.keys(this.formDistribution);
    const formData = Object.values(this.formDistribution);
    this.pieChartData.labels = [...formLabels];
    this.pieChartData.datasets[0].data = [...formData];

    // Mise à jour de l'histogramme (Top 10 Villes)
    const sortedCities = Object.entries(this.cityDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10
    const cityLabels = sortedCities.map(item => item[0]);
    const cityData = sortedCities.map(item => item[1]);
    this.barChartData.labels = [...cityLabels];
    this.barChartData.datasets[0].data = [...cityData];
  }

  // Méthodes utilitaires pour le template
  getObjectKeys(obj: { [key: string]: number }): string[] {
    return Object.keys(obj);
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    // Simple parsing, vous pouvez utiliser une librairie comme date-fns pour plus de robustesse
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Retourne la chaîne d'origine si parsing échoue
    return date.toLocaleDateString('fr-FR');
  }
}

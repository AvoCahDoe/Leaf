// src/app/features/statistiques/statistiques.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { Marker } from '../../../core/models/marker.model';
import { MarkerService } from '../../../core/services/marker.service';

Chart.register(...registerables);

interface CityFinancialData {
  totalTurnover: number;
  markerCount: number;
}

interface FormEmployeeData { // Assume similar structure exists for Turnover/Clients if needed for radar
  totalEmployees: number;
  markerCount: number;
}

interface YearlyCreationData {
  year: string;
  count: number;
}

// Assuming structures for Radar Chart calculations if not derived directly
interface FormComparisonData {
  form: string;
  avgEmployees: number;
  avgTurnover: number; // Potentially normalized for radar
  avgClients: number;
}

interface CityClientData {
  city: string;
  totalClients: number;
}

interface BoursePresenceData {
  hasBourse: string; // 'Avec Identifiant' ou 'Sans Identifiant'
  count: number;
}

interface YearlyTurnoverData {
  year: string;
  totalTurnover: number;
}
// ---------------------------------------------------

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective
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

  // --- Existing Statistiques ---
  totalMarkers = 0;
  avgEmployees: number | null = null;
  totalTurnover: number | null = null;
  formDistribution: { [key: string]: number } = {};
  cityDistribution: { [key: string]: number } = {};

  // --- New data structures for calculations ---
  cityFinancialData: { [city: string]: CityFinancialData } = {};
  formEmployeeData: { [form: string]: FormEmployeeData } = {}; // For existing chart 4

  yearlyCreationData: YearlyCreationData[] = [];
  formComparisonData: FormComparisonData[] = []; // For Radar Chart
  cityClientData: CityClientData[] = []; // For Horizontal Bar Chart
  boursePresenceData: BoursePresenceData[] = []; // For Bourse Pie Chart
  yearlyTurnoverData: YearlyTurnoverData[] = []; // For Line Chart
  // ---------------------------------------------

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

  // 2. Histogramme: Top 10 Villes (Nombre de Marqueurs)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: false } },
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

  // --- New Graph Configurations ---

  // 3. Histogramme: Chiffre d'Affaires par Ville (Top 10)
  public turnoverBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            // @ts-ignore
            return value.toLocaleString('fr-FR');
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            // @ts-ignore
            return `CA: ${parseFloat(context.parsed.y).toLocaleString('fr-FR')} DH`;
          }
        }
      }
    }
  };
  public turnoverBarChartType: ChartType = 'bar';
  public turnoverBarChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Chiffre d\'Affaires (DH)',
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  // 4. Histogramme: Nombre Moyen d'Employés par Forme Juridique
  public avgEmpPerFormChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Moy. Employés: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    }
  };
  public avgEmpPerFormChartType: ChartType = 'bar';
  public avgEmpPerFormChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre Moyen d\'Employés',
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // 5. Nuage de Points: Employés vs Chiffre d'Affaires
  public scatterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Nombre d\'Employés'
        },
        beginAtZero: true
      },
      y: {
        title: {
          display: true,
          text: 'Chiffre d\'Affaires (DH)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            // @ts-ignore
            return value.toLocaleString('fr-FR');
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            // @ts-ignore
            const dataPoint = context.raw as { x: number; y: number };
            return [
              `Employés: ${dataPoint.x}`,
              // @ts-ignore
              `CA: ${dataPoint.y.toLocaleString('fr-FR')} DH`
            ];
          }
        }
      }
    }
  };
  public scatterChartType: ChartType = 'scatter';
  public scatterChartData: ChartData<'scatter', { x: number; y: number }[], string> = {
    labels: ['Marqueurs'],
    datasets: [{
      data: [], // Will be filled with {x: employees, y: turnover}
      label: 'Marqueurs',
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  // 6. Histogramme: Distribution des Dates de Création (Années)
  public creationYearBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'x',
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Créations: ${ctx.parsed.y}` } }
    }
  };
  public creationYearBarChartType: ChartType = 'bar';
  public creationYearBarChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre de Créations',
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  };

  // 7. Diagramme Radar: Comparaison moyenne par Forme Juridique
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            // @ts-ignore
            const datasetLabel = ctx.dataset.label || '';
            // @ts-ignore
            const value = ctx.parsed?.toFixed ? ctx.parsed.toFixed(2) : ctx.parsed;
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    }
  };
  public radarChartType: ChartType = 'radar';
  public radarChartData: ChartData<'radar', number[], string> = {
    labels: ['Employés Moyens', 'CA Moyen (DH)', 'Clients Moyens'], // Axes du radar - Simplified assumption
    datasets: [] // Will be filled dynamically
  };

  // 8. Histogramme Horizontal: Top Villes par Clients Actifs
  public cityClientsHBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // Makes it horizontal
    scales: {
      x: { beginAtZero: true },
      y: { ticks: { autoSkip: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            // @ts-ignore
            return `Clients Actifs: ${parseFloat(ctx.parsed.x).toLocaleString('fr-FR')}`;
          }
        }
      }
    }
  };
  public cityClientsHBarChartType: ChartType = 'bar';
  public cityClientsHBarChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre Total de Clients Actifs',
      backgroundColor: 'rgba(153, 102, 255, 0.7)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };

  // 9. Camembert: Répartition par Présence d'Identifiant Bourse
  public boursePieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            // @ts-ignore
            const label = ctx.label || '';
            // @ts-ignore
            const value = ctx.parsed || 0;
            // @ts-ignore
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / 100) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  public boursePieChartType: ChartType = 'pie';
  public boursePieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(201, 203, 207, 0.8)'], // Vert, Gris
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(201, 203, 207, 1)'],
      borderWidth: 1
    }]
  };

  // 10. Graphique Linéaire: Évolution du CA par Année de Création
  public yearlyTurnoverLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            // @ts-ignore
            return value.toLocaleString('fr-FR');
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            // @ts-ignore
            return `CA Total: ${parseFloat(ctx.parsed.y).toLocaleString('fr-FR')} DH`;
          }
        }
      }
    }
  };
  public yearlyTurnoverLineChartType: ChartType = 'line';
  public yearlyTurnoverLineChartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Chiffre d\'Affaires Total (DH)',
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
      tension: 0.1
    }]
  };
  // ---------------------------------------------

  ngOnInit(): void {
    this.loadMarkers();
  }

  private loadMarkers(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Optional: force detection if needed early

    this.error = null;

    this.markerService.getMarkers().subscribe({
      next: (data) => {
        this.markers = data;
        this.calculateStats();
        this.updateChartData();
        this.isLoading = false;
        this.cdr.detectChanges(); // Optional: force detection if needed
      },
      error: (err) => {
        console.error('StatistiquesComponent: Error loading markers', err);
        this.error = 'Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue');
        this.isLoading = false;
        this.cdr.detectChanges(); // Optional: force detection if needed
      }
    });
  }

  private calculateStats(): void {
    this.totalMarkers = this.markers.length;

    // --- Existing Calculations ---
    const employeeCounts = this.markers
      .map(m => m.nombreEmployes)
      .filter((val): val is number => val !== undefined && val !== null);
    this.avgEmployees = employeeCounts.length > 0 ? employeeCounts.reduce((a, b) => a + b, 0) / employeeCounts.length : null;

    const turnovers = this.markers
      .map(m => m.chiffreAffaires)
      .filter((val): val is number => val !== undefined && val !== null);
    this.totalTurnover = turnovers.length > 0 ? turnovers.reduce((a, b) => a + b, 0) : null;

    this.formDistribution = {};
    this.markers.forEach(marker => {
      const form = marker.form || 'Non spécifiée';
      this.formDistribution[form] = (this.formDistribution[form] || 0) + 1;
    });

    this.cityDistribution = {};
    this.markers.forEach(marker => {
      const city = marker.city || 'Ville non spécifiée';
      this.cityDistribution[city] = (this.cityDistribution[city] || 0) + 1;
    });
    // -----------------------------

    // --- Calculations for NEW Graphs ---

    // 3. Données financières par ville (pour histogramme CA par ville)
    this.cityFinancialData = {};
    this.markers.forEach(marker => {
        const city = marker.city || 'Ville non spécifiée';
        const turnover = marker.chiffreAffaires;
        if (turnover !== undefined && turnover !== null) {
            if (!this.cityFinancialData[city]) {
                this.cityFinancialData[city] = { totalTurnover: 0, markerCount: 0 };
            }
            this.cityFinancialData[city].totalTurnover += turnover;
            this.cityFinancialData[city].markerCount += 1;
        }
    });

    // 4. Données des employés par forme (pour histogramme moy. employés par forme)
    this.formEmployeeData = {}; // Re-calculate if not done before or ensure consistency
    this.markers.forEach(marker => {
        const form = marker.form || 'Non spécifiée';
        const employees = marker.nombreEmployes;
        if (employees !== undefined && employees !== null) {
            if (!this.formEmployeeData[form]) {
                this.formEmployeeData[form] = { totalEmployees: 0, markerCount: 0 };
            }
            this.formEmployeeData[form].totalEmployees += employees;
            this.formEmployeeData[form].markerCount += 1;
        }
        // Hypothetical: Collect similar data for clients/turnover if needed for radar
        // This example simplifies by assuming radar data comes from averages calculated here or separately
    });

    // 6. Distribution des Dates de Création
    const creationYears: { [year: string]: number } = {};
    this.markers.forEach(marker => {
        if (marker.dateCreation) {
            // Handle potential date string formats robustly
            let year: string | null = null;
            const dateObj = new Date(marker.dateCreation);
            if (!isNaN(dateObj.getTime())) {
                 year = dateObj.getFullYear().toString();
            } else {
                // If dateCreation is a string like 'YYYY-MM-DD', extract year directly
                const parts = marker.dateCreation.split('-');
                if (parts.length > 0 && !isNaN(Number(parts[0]))) {
                     year = parts[0];
                }
            }
            if (year) {
                creationYears[year] = (creationYears[year] || 0) + 1;
            }
        }
    });
    this.yearlyCreationData = Object.entries(creationYears)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort chronologically

    // 7. Comparaison par Forme Juridique (Radar - Simplified Example)
    // This calculates average Employees, Turnover, Clients per form
    // Assumes turnover/client data is collected similarly to employees if not already present
    const formTurnoverData: { [form: string]: { totalTurnover: number; markerCount: number } } = {};
    const formClientData: { [form: string]: { totalClients: number; markerCount: number } } = {};

    this.markers.forEach(marker => {
        const form = marker.form || 'Non spécifiée';
        const employees = marker.nombreEmployes;
        const turnover = marker.chiffreAffaires;
        const clients = marker.nombreClientsActifs;

        if (employees !== undefined && employees !== null) {
            if (!this.formEmployeeData[form]) this.formEmployeeData[form] = { totalEmployees: 0, markerCount: 0 };
            this.formEmployeeData[form].totalEmployees += employees;
            this.formEmployeeData[form].markerCount += 1;
        }
        if (turnover !== undefined && turnover !== null) {
            if (!formTurnoverData[form]) formTurnoverData[form] = { totalTurnover: 0, markerCount: 0 };
            formTurnoverData[form].totalTurnover += turnover;
            formTurnoverData[form].markerCount += 1;
        }
        if (clients !== undefined && clients !== null) {
            if (!formClientData[form]) formClientData[form] = { totalClients: 0, markerCount: 0 };
            formClientData[form].totalClients += clients;
            formClientData[form].markerCount += 1;
        }
    });

    // Consolidate for radar chart data
    this.formComparisonData = [];
    const allForms = new Set([
        ...Object.keys(this.formEmployeeData),
        ...Object.keys(formTurnoverData),
        ...Object.keys(formClientData)
    ]);

    allForms.forEach(form => {
        const empData = this.formEmployeeData[form] || { totalEmployees: 0, markerCount: 0 };
        const turnData = formTurnoverData[form] || { totalTurnover: 0, markerCount: 0 };
        const clientData = formClientData[form] || { totalClients: 0, markerCount: 0 };

        const avgEmp = empData.markerCount > 0 ? empData.totalEmployees / empData.markerCount : 0;
        const avgTurn = turnData.markerCount > 0 ? turnData.totalTurnover / turnData.markerCount : 0;
        const avgClient = clientData.markerCount > 0 ? clientData.totalClients / clientData.markerCount : 0;

        this.formComparisonData.push({
            form,
            avgEmployees: avgEmp,
            avgTurnover: avgTurn,
            avgClients: avgClient
        });
    });

    // 8. Top Villes par Clients Actifs
    const rawCityClients: { [city: string]: number } = {};
    this.markers.forEach(marker => {
        const city = marker.city || 'Ville non spécifiée';
        const clients = marker.nombreClientsActifs;
        if (clients !== undefined && clients !== null) {
            rawCityClients[city] = (rawCityClients[city] || 0) + clients;
        }
    });
    this.cityClientData = Object.entries(rawCityClients)
      .map(([city, totalClients]) => ({ city, totalClients }))
      .sort((a, b) => b.totalClients - a.totalClients)
      .slice(0, 10); // Top 10

    // 9. Répartition par Présence d'Identifiant Bourse
    let withBourse = 0;
    let withoutBourse = 0;
    this.markers.forEach(marker => {
        if (marker.identifiantBourse && marker.identifiantBourse.trim() !== '') {
            withBourse++;
        } else {
            withoutBourse++;
        }
    });
    this.boursePresenceData = [
        { hasBourse: 'Avec Identifiant Bourse', count: withBourse },
        { hasBourse: 'Sans Identifiant Bourse', count: withoutBourse }
    ];

    // 10. Évolution du CA par Année de Création
    const yearlyTurnoverMap: { [year: string]: number } = {};
    this.markers.forEach(marker => {
        if (marker.dateCreation && marker.chiffreAffaires !== undefined && marker.chiffreAffaires !== null) {
             let year: string | null = null;
            const dateObj = new Date(marker.dateCreation);
            if (!isNaN(dateObj.getTime())) {
                 year = dateObj.getFullYear().toString();
            } else {
                const parts = marker.dateCreation.split('-');
                if (parts.length > 0 && !isNaN(Number(parts[0]))) {
                     year = parts[0];
                }
            }
            if (year) {
                yearlyTurnoverMap[year] = (yearlyTurnoverMap[year] || 0) + marker.chiffreAffaires;
            }
        }
    });
    this.yearlyTurnoverData = Object.entries(yearlyTurnoverMap)
      .map(([year, totalTurnover]) => ({ year, totalTurnover }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort chronologically
    // ----------------------------------
  }

  private updateChartData(): void {
    // --- Update Existing Charts ---
    const formLabels = Object.keys(this.formDistribution);
    const formData = Object.values(this.formDistribution);
    this.pieChartData.labels = [...formLabels];
    this.pieChartData.datasets[0].data = [...formData];

    const sortedCities = Object.entries(this.cityDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const cityLabels = sortedCities.map(item => item[0]);
    const cityData = sortedCities.map(item => item[1]);
    this.barChartData.labels = [...cityLabels];
    this.barChartData.datasets[0].data = [...cityData];
    // -------------------------------

    // --- Update NEW Charts ---

    // 3. Histogramme: Chiffre d'Affaires par Ville (Top 10)
    const sortedCityFinances = Object.entries(this.cityFinancialData)
      .sort((a, b) => b[1].totalTurnover - a[1].totalTurnover)
      .slice(0, 10);
    const finCityLabels = sortedCityFinances.map(item => item[0]);
    const finCityData = sortedCityFinances.map(item => item[1].totalTurnover);
    this.turnoverBarChartData.labels = [...finCityLabels];
    this.turnoverBarChartData.datasets[0].data = [...finCityData];

    // 4. Histogramme: Nombre Moyen d'Employés par Forme Juridique
    const avgEmpPerFormLabels: string[] = [];
    const avgEmpPerFormData: number[] = [];
    for (const [form, data] of Object.entries(this.formEmployeeData)) {
        if (data.markerCount > 0) {
            avgEmpPerFormLabels.push(form);
            avgEmpPerFormData.push(data.totalEmployees / data.markerCount);
        }
    }
    this.avgEmpPerFormChartData.labels = [...avgEmpPerFormLabels];
    this.avgEmpPerFormChartData.datasets[0].data = [...avgEmpPerFormData];

    // 5. Nuage de Points: Employés vs Chiffre d'Affaires
    const scatterDataPoints = this.markers
      .filter(m => m.nombreEmployes !== undefined && m.nombreEmployes !== null &&
                   m.chiffreAffaires !== undefined && m.chiffreAffaires !== null)
      .map(m => ({ x: m.nombreEmployes!, y: m.chiffreAffaires! }));
    // Ensure data array is recreated for change detection
    this.scatterChartData.datasets[0].data = [...scatterDataPoints];

    // 6. Histogramme: Distribution des Dates de Création (Années)
    this.creationYearBarChartData.labels = this.yearlyCreationData.map(d => d.year);
    this.creationYearBarChartData.datasets[0].data = this.yearlyCreationData.map(d => d.count);

    // 7. Diagramme Radar: Comparaison moyenne par Forme Juridique
    const formsForRadar = this.formComparisonData.map(d => d.form);
    const avgEmpsRadar = this.formComparisonData.map(d => d.avgEmployees);
    const avgTurnsRadar = this.formComparisonData.map(d => d.avgTurnover);
    const avgClientsRadar = this.formComparisonData.map(d => d.avgClients);

    // Simple normalization example for radar (optional, but often useful)
    const maxTurnoverRadar = Math.max(...avgTurnsRadar, 1);
    const avgTurnsNormalizedRadar = avgTurnsRadar.map(v => maxTurnoverRadar > 0 ? (v / maxTurnoverRadar) * 100 : 0);

    this.radarChartData.labels = ['Employés Moyens', 'CA Moyen (Normalisé %)', 'Clients Moyens'];
    // Create datasets for each metric
    this.radarChartData.datasets = [
        {
            label: 'Employés Moyens',
            data: avgEmpsRadar,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
        },
        {
            label: 'CA Moyen (Normalisé %)',
            data: avgTurnsNormalizedRadar, // Use normalized data
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
        },
        {
            label: 'Clients Moyens',
            data: avgClientsRadar,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            pointBackgroundColor: 'rgb(75, 192, 192)',
        }
    ];

    // 8. Histogramme Horizontal: Top Villes par Clients Actifs
    this.cityClientsHBarChartData.labels = this.cityClientData.map(d => d.city);
    this.cityClientsHBarChartData.datasets[0].data = this.cityClientData.map(d => d.totalClients);

    // 9. Camembert: Répartition par Présence d'Identifiant Bourse
    this.boursePieChartData.labels = this.boursePresenceData.map(d => d.hasBourse);
    this.boursePieChartData.datasets[0].data = this.boursePresenceData.map(d => d.count);

    // 10. Graphique Linéaire: Évolution du CA par Année de Création
    this.yearlyTurnoverLineChartData.labels = this.yearlyTurnoverData.map(d => d.year);
    this.yearlyTurnoverLineChartData.datasets[0].data = this.yearlyTurnoverData.map(d => d.totalTurnover);
    // -----------------------------------
  }

  // --- Utility Functions for Template ---
  getObjectKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj);
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    // Use French locale and handle potential float formatting
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    let date: Date;
    // Try parsing as ISO date string first
    date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        // If that fails, assume it's already a readable string or handle specific format
        // For simplicity, returning the original string
        return dateStr;
    }
    return date.toLocaleDateString('fr-FR');
  }
  // ---------------------------------------
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrls: ['./dashboard-estadisticas.component.scss']
})
export class DashboardEstadisticasComponent implements OnInit {
  fechaInicio: string = '';
  fechaFin: string = '';

  chart1: any;
  chart2: any;
  chart3: any;

  constructor(private pubService: PublicacionesService) {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace30Dias.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.generarGraficos();
  }

  generarGraficos(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Seleccioná ambas fechas');
      return;
    }

    this.cargarGraficoPubsPorUsuario();
    this.cargarGraficoComentariosTotales();
    this.cargarGraficoComentariosPorPub();
  }

    cargarGraficoPubsPorUsuario(): void {
        this.pubService.obtenerStatsPubsPorUsuario(this.fechaInicio, this.fechaFin).subscribe({
        next: (res: any) => {
            // BLINDAJE: Si viene envuelto en { data: [...] } lo saca, si ya es array lo usa directamente
            const lista = Array.isArray(res) ? res : (res?.data || []);

            const labels = lista.map((d: any) => d.username || d.nombreUsuario || 'Usuario');
            const valores = lista.map((d: any) => d.totalPublicaciones || 0);

            if (this.chart1) this.chart1.destroy();

            this.chart1 = new Chart('canvasPubsUsuario', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                label: 'Publicaciones realizadas',
                data: valores,
                backgroundColor: '#0d6efd',
                borderRadius: 4
                }]
            },
            options: { responsive: true }
            });
        },
        error: (err: any) => console.error(err)
        });
    }

  cargarGraficoComentariosTotales(): void {
    this.pubService.obtenerStatsComentariosTotales(this.fechaInicio, this.fechaFin).subscribe({
      next: (res: any) => {
        const total = res.total || 0;

        if (this.chart2) this.chart2.destroy();

        this.chart2 = new Chart('canvasComentariosTotales', {
          type: 'doughnut',
          data: {
            labels: ['Total Comentarios en periodo'],
            datasets: [{
              data: [total],
              backgroundColor: ['#198754'],
              hoverOffset: 4
            }]
          },
          options: { responsive: true }
        });
      },
      error: (err: any) => console.error(err)
    });
  }

    cargarGraficoComentariosPorPub(): void {
        this.pubService.obtenerStatsComentariosPorPub(this.fechaInicio, this.fechaFin).subscribe({
        next: (res: any) => {
            // BLINDAJE EXACTAMENTE IGUAL AL ANTERIOR:
            const lista = Array.isArray(res) ? res : (res?.data || []);

            const labels = lista.map((d: any) => d.titulo ? (d.titulo.length > 15 ? d.titulo.substring(0, 15) + '...' : d.titulo) : 'Sin título');
            const valores = lista.map((d: any) => d.totalComentarios || 0);

            if (this.chart3) this.chart3.destroy();

            this.chart3 = new Chart('canvasComentariosPorPub', {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                label: 'Comentarios recibidos',
                data: valores,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                fill: true,
                tension: 0.3
                }]
            },
            options: { responsive: true }
            });
        },
        error: (err: any) => console.error(err)
        });
    }
}
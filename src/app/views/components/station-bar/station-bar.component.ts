import { Component, inject, Input, OnInit } from '@angular/core';
import { Station } from 'src/app/core/models/station.model';
import { RouterLinkActive, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss'],
  imports: [RouterLinkActive, RouterLink],
})
export class StationBarComponent implements OnInit {
  @Input() station?: Station;
  private router: Router = inject(Router);

  constructor() {}

  ngOnInit() {
    console.log('StationBar loaded:', this.station);
  }

  navigateToStation(stationId: string) {
    // Implement navigation logic here, e.g., using Angular Router
    this.router.navigate(['/station', stationId]);
  }
}

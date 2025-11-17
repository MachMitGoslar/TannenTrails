import { Component, Input, OnInit } from '@angular/core';
import { Station } from 'src/app/core/models/station.model';

@Component({
  selector: 'app-station-bar',
  templateUrl: './station-bar.component.html',
  styleUrls: ['./station-bar.component.scss'],
})
export class StationBarComponent implements OnInit {
  @Input() station?: Station;

  constructor() {}

  ngOnInit() {
    console.log('StationBar loaded:', this.station);
  }
}

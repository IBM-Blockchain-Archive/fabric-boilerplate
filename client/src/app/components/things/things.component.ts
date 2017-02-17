import {Component, OnInit} from '@angular/core';
import {ThingService} from '../../services/thing.service';

@Component({
  selector:    'app-things',
  templateUrl: './things.component.html',
  styleUrls:   ['./things.component.css']
})
export class ThingsComponent implements OnInit {
  private things: any;

  public constructor(private _thingsService: ThingService) {
  }

  public ngOnInit() {
    this._thingsService.getThingsByUser().subscribe(things => {
      console.log(things);
      this.things = things;
    });
  }
}

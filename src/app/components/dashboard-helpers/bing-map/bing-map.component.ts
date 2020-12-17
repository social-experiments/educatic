/// <reference path="../../../../../node_modules/bingmaps/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />
// Needs to have reference to types otherwise there will be a compile time exception when the script hasn't loaded 
// and the types are unknown. 

import { Component, ViewChild, OnInit, OnChanges, Input } from '@angular/core';
import { IDashboardSchool } from '../../../_models/dashboard-models/dashboard-school'; 


@Component({
  selector: 'bing-map',
  templateUrl: './bing-map.component.html',
  styleUrls: ['./bing-map.component.scss'],
})
/**
 * This class updates the bing map embedded in the dashboard. When the schools selected in the dashboard 
 * are updated, this component is notified. It then parses the currently selected schools and updates the 
 * bing map based on their latitude and longitudes. 
 */
export class BingMapComponent implements OnInit, OnChanges {
  @ViewChild('myMap') myMap; // using ViewChild to reference the div instead of setting an id
  @Input() schools: IDashboardSchool[] = [];
  map: Microsoft.Maps.Map;  


  /**
   * When the currently selected schools changes, updates the map. 
   */
  ngOnChanges() { 
    if (this.map && this.schools) {
      // Gets rid of what's currently on the map 
      this.map.layers.clear();
      let layer: Microsoft.Maps.Layer = new Microsoft.Maps.Layer();
      let locations: Microsoft.Maps.Location[] = []; 
      for (let school of this.schools) {
        let pin: Microsoft.Maps.Pushpin; 
        if (school.latitude && school.longitude) {
          pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(school.latitude, school.longitude), { title: school.name });
          locations.push(pin.getLocation()); 
          layer.add(pin);
        }
        // Chooses the best bounds to display all the school locations 
        let bounds = Microsoft.Maps.LocationRect.fromLocations(locations);
        this.map.setView({bounds: bounds});
        this.map.layers.insert(layer);
      }
    }
  }  

  ngOnInit() {
     // Add a global function for the callback from Bing Maps api
     (<any>window).OnLoadBingMapsApi = () => this.InitMap();

     // Add programmaticaly the external Bing maps api script
     let scriptTag = document.createElement("script");
     scriptTag.src = "https://www.bing.com/api/maps/mapcontrol?callback=OnLoadBingMapsApi";
     scriptTag.id = "scriptBingMaps";
     scriptTag.async = true; 
     // Inject the dynamic script in the DOM
     document.head.appendChild(scriptTag);
  }

  InitMap(){  // after the view completes initializaion, create the map. Uses my personal bing maps api key currently
    this.map = new Microsoft.Maps.Map(this.myMap.nativeElement, {
        credentials: 'Agl1OUJpxhobILNXiGeeP92f2mQnWP3b1dloH9Sj56LGR1poYMRNYhLZyQZeY3Mu'
    });
  }
}
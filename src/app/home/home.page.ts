import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as tt from '@tomtom-international/web-sdk-maps';
import { environment } from 'src/environments/environment';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  map: any;
  currentLat = 0;
  currentLon = 0;
  showSearch = false;
  getValue: (value: string) => void;

  rootURL = 'https://api.tomtom.com/search/2/search/';
  searchResults: any = [];

  constructor(private httpClient: HttpClient) {}

  public ngAfterViewInit(): void {
    this.initLocationMap();
    this.getValue = (value: string) => {
      this.httpClient
        .get(
          this.rootURL +
            `${value}.json?
          lat=${this.currentLat}&
          lon=${this.currentLon}&
          minFuzzyLevel=1&
          maxFuzzyLevel=2&
          view=Unified&
          relatedPois=off&
          key=${environment.tomtom.key}`
        )
        .subscribe((data: any) => (this.searchResults = data.results));
    };
  }

  fabClick() {
    this.showSearch = !this.showSearch;
    console.log('Clicked fab...');
  }

  setPlaceLocation(lat: number, lng: number, placeName: string): void {
    this.map.flyTo({
      center: {
        lat,
        lng,
      },
      zoom: 13,
    });

    const popup = new tt.Popup({
      anchor: 'bottom',
      offset: { bottom: [0, -40] },
    }).setHTML(placeName);

    const marker = new tt.Marker()
      .setLngLat({
        lat,
        lng,
      })
      .addTo(this.map);
    marker.setPopup(popup).togglePopup();
  }

  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          this.currentLon = position.coords.longitude;
          this.currentLat = position.coords.latitude;
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

  private initLocationMap(): void {
    this.map = tt.map({
      key: environment.tomtom.key,
      container: 'map',
    });

    this.map.addControl(new tt.FullscreenControl());
    this.map.addControl(new tt.NavigationControl());

    this.getCurrentPosition().subscribe((position: any) => {
      this.map.flyTo({
        center: {
          lat: position.latitude,
          lng: position.longitude,
        },
        zoom: 13,
      });

      const popup = new tt.Popup({
        anchor: 'bottom',
        offset: { bottom: [0, -40] },
      }).setHTML('You are here');

      const marker = new tt.Marker()
        .setLngLat({
          lat: position.latitude,
          lng: position.longitude,
        })
        .addTo(this.map);
      marker.setPopup(popup).togglePopup();
    });
  }
} // class

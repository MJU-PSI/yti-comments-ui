import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { ServiceConfiguration } from '../entity/service-configuration';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {

  configuration: ServiceConfiguration;

  constructor(private dataService: DataService) {

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.configuration = configuration;
    });
  }

  get loading(): boolean {

    return this.configuration == null;
  }

  get env(): string {

    return this.configuration.env;
  }

  get groupManagementUrl(): string {

    return this.configuration.groupManagementConfig.url;
  }

  get terminologyUrl(): string {

    return this.configuration.terminologyConfig.url;
  }

  get dataModelUrl(): string {

    return this.configuration.dataModelConfig.url;
  }

  get codelistUrl(): string {

    return this.configuration.codelistConfig.url;
  }

  getUriWithEnv(uri: string): string | null {

    if (uri && this.env !== 'prod') {
      return uri + '?env=' + this.env;
    }
    return uri ? uri : null;
  }

}

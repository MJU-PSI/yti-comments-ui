import { Injectable } from '@angular/core';
import { ServiceConfiguration } from '../entities/service-configuration';
import { HttpClient } from '@angular/common/http';
import { configApiUrl } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private configurationPromise?: Promise<ServiceConfiguration>;
  private configuration_?: ServiceConfiguration;

  constructor(private http: HttpClient) {
  }

  get configuration(): ServiceConfiguration {
    if (this.configuration_) {
      return this.configuration_;
    }
    throw new Error("ConfigurationService used before initialization");
  }

  fetchConfiguration(): Promise<ServiceConfiguration> {
    if (!this.configurationPromise) {
      this.configurationPromise = new Promise((resolve, refuse) => {
        this.http.get<ServiceConfiguration>(configApiUrl)
          .subscribe(configuration => {
            this.configuration_ = configuration;
            resolve(configuration);
          }, error => {
            refuse(error);
          });
      });
    }
    return this.configurationPromise;
  }


  get loading(): boolean {

    return this.configuration == null;
  }

  get env(): string {

    return this.configuration.env;
  }

  get isMessagingEnabled(): boolean {

    return this.configuration.messagingConfig.enabled;
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

    uri = uri.replace('#', '%23');
    if (uri && this.env !== 'prod') {
      return uri + '?env=' + this.env;
    }
    return uri ? uri : null;
  }

  getEnvironmentIdentifier(style?: 'prefix' | 'postfix'): string {

    if (this.env && this.env !== 'prod') {
      const identifier = this.env.toUpperCase();
      if (!style) {
        return identifier;
      } else if (style === 'prefix') {
        return identifier + ' - ';
      } else if (style === 'postfix') {
        return ' - ' + identifier;
      }
    }
    return '';
  }

  get showUnfinishedFeature(): boolean {

    return this.env === 'awsdev' || this.env === 'local';
  }
}

import { ReflectiveInjector } from '@angular/core';
import { DatesService } from '../services/dates.service';
import { Organization } from './organization';
import { Project } from './project';
import { Team } from './team';

export class Company extends Organization {
  public premium_expiry: Date;
  public premium_limit: number;
  public projects: Project[] = [];

  constructor(values: any) {
    super(values);
    if (values.premium_expiry) {
      if (values.premium_expiry instanceof Date) {
        this.premium_expiry = values.premium_expiry;
      } else {
        this.premium_expiry = this.getDatesService().parseDate(values.premium_expiry);
      }
    }
    this.premium_limit = values.premium_limit;
    if (values.filtered_projects) {
      values.filtered_projects.forEach((project) => {
        let newProject: Project = new Project(project);
        newProject.company = this;
        this.projects.push(newProject);
      });
    }
  }

  get uniqueId(): string {
    return 'C' + this.id;
  }

  isCompany(): boolean {
    return true;
  }

  get premium_expiry_string(): string {
    return this.getDatesService().getDateString(this.premium_expiry);
  }

  getAllTeams(): Team[] {
    let allTeams: Team[] = [];
    this.projects.forEach((project: Project) => {
      allTeams = allTeams.concat(project.teams);
    });
    allTeams.sort((v1: Team, v2: Team) => {
      if (v1.name < v2.name) {
        return -1;
      } else if (v1.name > v2.name) {
        return 1;
      } else {
        return 0;
      }
    });
    return allTeams;
  }

  private getDatesService(): DatesService {
    return ReflectiveInjector.resolveAndCreate([DatesService]).get(DatesService);
  }
}

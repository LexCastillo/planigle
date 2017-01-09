import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Company } from '../models/company';

const baseUrl = 'api/companies';

@Injectable()
export class CompaniesService {
  constructor(private http: Http) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get(baseUrl)
      .map((res: any) => res.json())
      .map((companies: Array<any>) => {
        let result: Array<Company> = [];
        if (companies) {
          companies.forEach((company) => {
            result.push(
              new Company(company)
            );
          });
        }
        return result;
      });
  }
  
  create(company: Company): Observable<Company> {
    return this.createOrUpdate(company, this.http.post, '');
  }

  update(company: Company): Observable<Company> {
    return this.createOrUpdate(company, this.http.put, '/' + company.id);
  }

  delete(company: Company): Observable<Company> {
    return this.http.delete(baseUrl + '/' + company.id)
      .map((res: any) => res.json())
      .map((response: any) => {
        if (response.hasOwnProperty('record')) {
          return new Company(response.record);
        } else {
          return new Company(response);
        }
      });
  }

  private createOrUpdate(company: Company, method, idString): Observable<Company> {
    let headers: Headers = new Headers({ 'Content-Type': 'application/json' });
    let options: RequestOptions = new RequestOptions({ headers: headers });
    let record: any = {
      name: company.name
    };
    return method.call(this.http, baseUrl + idString, {record: record}, options)
      .map((res: any) => res.json())
      .map((updatedCompany: any) => {
        return new Company(updatedCompany);
      });
  }
}

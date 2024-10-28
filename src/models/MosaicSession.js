export default class MosaicSession {
    constructor(client_application_id) {
      this.client_application_id = client_application_id;
      this.url = null;
      this.apiVersion = '/api/v1';
  
      this.user = null;
      this.experiment_id = null;
      this.project = null;
      this.geneSet = null;
  
      this.tokenType = null;
      this.authorizationString = null;
    }
  
    promiseInit(source, projectId, tokenType, sampleId = null) {
      let self = this;
      self.tokenType = tokenType;
      self.api = source + self.apiVersion;
      self.project_id = projectId;
      self.sample_id = sampleId;
  
      self.authorizationString = `${tokenType} ${localStorage.getItem('mosaic-iobio-tkn')}`;
      
      return new Promise((resolve, reject) => {
        const userPromise = self.promiseGetCurrentUser();
        const projectPromise = self.promiseGetProject(projectId);

        // Wait for both promises to complete
        Promise.all([userPromise, projectPromise])
            .then(([userData, projectData]) => {
            self.user = userData;
            self.project = projectData;
            resolve(); // Resolve the main promise once both are done
            })
            .catch(error => {
            console.error(error);
            reject(error); // Reject if either promise fails
            });
      });
    }
  
    promiseGetCurrentUser() {
      let self = this;
      return new Promise((resolve, reject) => {
        self.getCurrentUser()
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            const errorMsg = error.message || "Error getting current Mosaic user. Your authorization may have expired. Make sure you are still logged into Mosaic, and relaunch the project.";
            reject(errorMsg);
          });
      });
    }
  
    async getCurrentUser() {
      let self = this;
      const response = await fetch(`${self.api}/user`, {
        method: 'GET',
        headers: {
          Authorization: self.authorizationString,
          accept: 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return response.json();
    }
  
    promiseGetProject(projectId) {
      let self = this;
      return new Promise((resolve, reject) => {
        self.getProject(projectId)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            const errorMsg = self.getErrorMessage(error);
            console.error(`Error getting project from Mosaic with project_id ${projectId}`);
            console.error(errorMsg);
            reject(`Error getting project ${projectId}: ${errorMsg}`);
          });
      });
    }
  
    async getProject(projectId) {
      let self = this;
      const response = await fetch(`${self.api}/projects/${projectId}`, {
        method: 'GET',
        headers: {
          Authorization: self.authorizationString,
          accept: 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return response.json();
    }
  
    // ---- Get the sample HPO terms
    promiseGetSampleHpoTerms(projectId, sampleId) {
      let self = this;
      return new Promise((resolve, reject) => {
        self.getSampleHpoTerms(projectId, sampleId)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            const errorMsg = self.getErrorMessage(error);
            console.error(`Error getting sample HPO terms from Mosaic with sample_id ${sampleId}`);
            console.error(errorMsg);
            reject(`Error getting sample HPO terms ${sampleId}: ${errorMsg}`);
          });
      });
    }
  
    async getSampleHpoTerms(projectId, sampleId) {
      let self = this;
      const response = await fetch(`${self.api}/projects/${projectId}/samples/${sampleId}/hpo-terms`, {
        method: 'GET',
        headers: {
          Authorization: self.authorizationString,
          accept: 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return response.json();
    }
  
    getErrorMessage(error) {
      if (error.hasOwnProperty('message')) {
        return error.message;
      } else {
        return error.toString();
      }
    }
  }

export default class MosaicSession {
    constructor(client_application_id) {
      this.client_application_id = client_application_id;
      this.url = null;
      this.apiVersion = '/api/v1';
  
      this.user = null;
      this.experiment_id = null;
      this.experiment = 'sv';
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

    promiseGetProjectSettings(projectId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getProjectSettings(projectId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting project settings from Mosaic with project_id ${projectId}`);
                console.error(errorMsg);
                reject(`Error getting project settings ${projectId}: ${errorMsg}`);
            });
        });
    }

    async getProjectSettings(projectId) {
        let self = this;
        const response = await fetch(`${self.api}/projects/${projectId}/settings`, {
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

    promiseGetProjectSamples(projectId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getProjectSamples(projectId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting project samples from Mosaic with project_id ${projectId}`);
                console.error(errorMsg);
                reject(`Error getting project samples ${projectId}: ${errorMsg}`);
            });
        });
    }

    async getProjectSamples(projectId) {
        let self = this;
        const response = await fetch(`${self.api}/projects/${projectId}/samples`, {
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

    promiseGetSampleAttributes(projectId, sampleId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getSampleAttributes(projectId, sampleId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting sample attributes from Mosaic with sample_id ${sampleId}`);
                console.error(errorMsg);
                reject(`Error getting sample attributes ${sampleId}: ${errorMsg}`);
            });
        });
    }

    async getSampleAttributes(projectId, sampleId) {
        let self = this;
        const response = await fetch(`${self.api}/projects/${projectId}/samples/${sampleId}/attributes`, {
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

    promiseGetFileForSvIobio(projectId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getFileForSvIobio(projectId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting file for sv iobio from Mosaic with project_id ${projectId}`);
                console.error(errorMsg);
                reject(`Error getting file for sv iobio ${projectId}: ${errorMsg}`);
            });
        });

    }

    async getFileForSvIobio(projectId) {
      let self = this;
      //TODO: not sure if this will actually work I dont see this in the api docs
      const response = await fetch(`${self.api}/projects/${projectId}/files?experiment%5B%5D=${self.experiment}`, {
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

    promiseGetSignedUrlForFile(projectId, fileId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getSignedUrlForFile(projectId, fileId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting signed url for file from Mosaic with project_id ${projectId}`);
                console.error(errorMsg);
                reject(`Error getting signed url for file ${projectId}: ${errorMsg}`);
            });
        });

    }

    async getSignedUrlForFile(projectId, fileId) {
      let self = this;
      const response = await fetch(`${self.api}/projects/${projectId}/files/${fileId}/url`, {
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

    promiseGetExperiment(projectId, experimentId) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.getExperiment(projectId, experimentId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                const errorMsg = self.getErrorMessage(error);
                console.error(`Error getting experiment from Mosaic with project_id ${projectId}`);
                console.error(errorMsg);
                reject(`Error getting experiment ${projectId}: ${errorMsg}`);
            });
        });
    }

    async getExperiment(projectId, experimentId) {
      let self = this;
      const response = await fetch(`${self.api}/projects/${projectId}/experiments/${experimentId}`, {
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

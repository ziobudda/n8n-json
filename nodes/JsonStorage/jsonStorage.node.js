'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

class JsonStorage {
    constructor() {
        // Versione del nodo - aggiornare quando si fanno modifiche
        this.nodeVersion = '0.1.7';
        
        // Otteniamo il percorso corrente
        const currentDir = process.cwd();
        const defaultFilePath = path.join(currentDir, 'data', 'custom_json.json');
        
        this.description = {
            displayName: 'JSON Storage ' + this.nodeVersion,
            name: 'jsonStorage',
            group: ['transform'],
            version: 1,
            description: 'Store and retrieve key-value pairs in a JSON file',
            defaults: {
                name: 'JSON Storage ' + this.nodeVersion,
            },
            inputs: ['main'],
            outputs: ['main'],
            icon: 'file:jsonStorage.svg',
            iconUrl: 'file:jsonStorage.svg',
            properties: [
                // Definizione delle proprietà del nodo
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Save',
                            value: 'save',
                            description: 'Save a key-value pair to the JSON file',
                        },
                        {
                            name: 'Read',
                            value: 'read',
                            description: 'Read a value by key from the JSON file',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            description: 'Delete a key-value pair from the JSON file',
                        },
                    ],
                    default: 'save',
                },
                // Proprietà per l'operazione "save", "read" e "delete"
                {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['save', 'read', 'delete'],
                        },
                    },
                    default: '',
                    description: 'The key to save, retrieve or delete',
                },
                // Proprietà solo per l'operazione "save"
                {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['save'],
                        },
                    },
                    default: '',
                    description: 'The value to save',
                },
                // Percorso del file (modificato da readonly a editabile)
                {
                    displayName: 'File Path',
                    name: 'filePath',
                    type: 'string',
                    default: defaultFilePath,
                    description: 'Full path to the JSON file (directory will be created if it does not exist)',
                    required: true,
                },
                // Informazioni utili (solo visualizzazione)
                {
                    displayName: 'Info',
                    name: 'info',
                    type: 'notice',
                    default: 'Values are stored as base64 encoded strings in the JSON file',
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];

        // Parametri principali
        const operation = this.getNodeParameter('operation', 0);
        const filePath = this.getNodeParameter('filePath', 0);
        
        try {
            // Assicuriamoci che la directory del file esista
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            // Carichiamo il file JSON esistente o creiamo un oggetto vuoto
            let storage = {};
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                storage = JSON.parse(fileContent);
            }
            
            // Eseguiamo l'operazione richiesta
            if (operation === 'save') {
                // Implementazione diretta per save
                for (let i = 0; i < items.length; i++) {
                    const key = this.getNodeParameter('key', i);
                    const value = this.getNodeParameter('value', i);
                    
                    // Convertiamo il valore in base64
                    const encodedValue = Buffer.from(value).toString('base64');
                    
                    // Salviamo la coppia chiave-valore
                    storage[key] = encodedValue;
                    
                    // Scriviamo i dati su file
                    fs.writeFileSync(filePath, JSON.stringify(storage, null, 2));
                    
                    // Restituiamo un formato uniforme che include il valore anche per le operazioni di salvataggio
                    returnData.push({
                        json: {
                            success: true,
                            key,
                            value,
                        },
                    });
                }
            } else if (operation === 'read') {
                // Implementazione diretta per read
                for (let i = 0; i < items.length; i++) {
                    const key = this.getNodeParameter('key', i);
                    
                    if (storage[key] !== undefined) {
                        // Decodifichiamo il valore da base64
                        const decodedValue = Buffer.from(storage[key], 'base64').toString('utf8');
                        
                        returnData.push({
                            json: {
                                success: true,
                                key,
                                value: decodedValue,
                            },
                        });
                    } else {
                        // Se la chiave non esiste, restituiamo un valore vuoto
                        returnData.push({
                            json: {
                                success: false,
                                key,
                                value: "",
                            },
                        });
                    }
                }
            } else if (operation === 'delete') {
                // Implementazione diretta per delete
                for (let i = 0; i < items.length; i++) {
                    const key = this.getNodeParameter('key', i);
                    
                    if (storage[key] !== undefined) {
                        // Eliminiamo la chiave dal file JSON
                        delete storage[key];
                        
                        // Scriviamo i dati aggiornati su file
                        fs.writeFileSync(filePath, JSON.stringify(storage, null, 2));
                        
                        returnData.push({
                            json: {
                                success: true,
                                key,
                                deleted: true,
                            },
                        });
                    } else {
                        // Se la chiave non esiste, restituiamo un messaggio di errore
                        returnData.push({
                            json: {
                                success: false,
                                key,
                                deleted: false,
                                message: "Key not found",
                            },
                        });
                    }
                }
            }
            
            return [returnData];
        } catch (error) {
            if (this.continueOnFail()) {
                return [[{ json: { 
                    success: false,
                    error: error.message,
                } }]];
            }
            throw error;
        }
    }
}

// Esportiamo sia con la prima lettera maiuscola che minuscola per compatibilità
module.exports = { 
    JsonStorage,           // Prima lettera maiuscola
    jsonStorage: JsonStorage // Prima lettera minuscola
};

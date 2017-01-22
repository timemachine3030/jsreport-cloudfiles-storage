# jsreport-pkgcloud-storage
[![NPM Version](http://img.shields.io/npm/v/jsreport-pkgcloud-storage.svg?style=flat-square)](https://npmjs.com/package/jsreport-pkgcloud-storage)

> jsreport extension adding support for storing blobs in pkgcloud supported cloud storage.

Some of the jsreport extensions requires a blob storage for storing binary objects. This implementation stores these objects like output reports inside in a cloud storage service provider. This library supports:

- Amazon
- Azure
- Google
- HP
- Openstack
- Rackspace

##Installation

> npm install jsreport-pkgcloud-storage

##Configuration

### Rackspace

Global `blobStorage` options
```js
{
	"blobStorage": {  
            "name": "pkgcloud-storage", 
            "container": "...", // Defaults for `jsreports`
            "connection":  { 
                provider: 'rackspace', // required
                username: 'your-user-name', // required
                apiKey: 'your-api-key', // required
                region: 'IAD', // required, regions can be found at:
                               // http://www.rackspace.com/knowledge_center/article/about-regions
                useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
            }
        }
```	

"use strict";
const config = require("@simpleworkjs/conf");
const axios = require("axios");
require("dotenv").config();

// # Flow of my program
// # first get IP records of the using my base.js domain records
// # if the IP and my current Public IP is different i should use CF API and update it

class CloudFlare {
	constructor(config) {
		this.config = config;
	}
	//write the logic to comapre both public ip if one is different or blah update accordingly
	async compareIP(domainName) {
		try {
			// console.log(await this.getIP())
			// console.log(await this.getDNS(domainName))
			if ((await this.getIP()) !== (await this.getDNS(domainName))) {
				// console.log(domainName)
				//call updateDNS
				const newIp = await this.getIP();
				this.updateDNS(newIp, domainName);
			}
		} catch (error) {
			console.log(error);
		}
	}

	// async getAllDNS(subDomain) {
	//     try {
	//         // Access config based on the subdomain (e.g., 'memos' or 'proxy')
	//         const domainConfig = config.domains[subDomain];

	//         const options = {
	//             method: 'GET',
	//             // Cloudflare API list records endpoint
	//             url: `${domainConfig.baseUrl}/${domainConfig.zoneId}/dns_records`,
	//             headers: {
	//                 'Content-Type': 'application/json',
	//                 // Using the shared API token from your config
	//                 'Authorization': "Bearer " + config.domains.apiToken
	//             }
	//         };

	//         let cfRes = await axios.request(options);

	//         // This will print all records. Look for the 'id' field
	//         // to find your 'cloudflareDnsId' for the config.
	//         console.log(`--- DNS Records for ${subDomain} ---`);
	//         console.table(cfRes.data.result.map(r => ({
	//             id: r.id,
	//             name: r.name,
	//             type: r.type,
	//             content: r.content
	//         })));

	//         return cfRes.data.result;

	//     } catch (error) {
	//         // Improved error logging to see exactly what Cloudflare says
	//         if (error.response) {
	//             console.error("Cloudflare Error:", error.response.data);
	//         } else {
	//             console.error("Error:", error.message);
	//         }
	//     }
	// }

	//Use as helper by compareIp()
	async getIP() {
		try {
			const res = await axios.get("https://wtfismyip.com/json");
			// console.log(res.data.YourFuckingIPAddress);
			return res.data.YourFuckingIPAddress;
		} catch (error) {
			console.log(error.response);
		}
	}

	async getDNS(domainName) {
		try {
			const subDomain = domainName.split(".")[0];
			const options = {
				method: "GET",
				url: `${config.domains[subDomain].baseUrl}/${config.domains[subDomain].zoneId}/dns_records/${config.domains[subDomain].cloudflareDnsId}`,
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + config.domains.apiToken,
				},
			};
			let cfRes = await axios.request(options);
			// console.log(cfRes.data.result.content)
			return cfRes.data.result.content; // will return ip currently being used by the subdomain
		} catch (error) {
			console.log(error.response);
		}
	}

	//the logic will be called in compareIP
	async updateDNS(iP, domainName) {
		try {
			//required!
			// content
			// name
			// type
			const subDomain = domainName.split(".")[0];
			const utcTime = new Date().toISOString();

			const options = {
				method: "PATCH",
				url: `${config.domains[subDomain].baseUrl}/${config.domains[subDomain].zoneId}/dns_records/${config.domains[subDomain].cloudflareDnsId}`,
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + config.domains.apiToken,
				},
				data: {
					content: iP,
					name: domainName,
					type: "A",
					comment: `auto updated at ${utcTime} for ${domainName} `,
				},
			};
			let cfRes = await axios.request(options);
		} catch (error) {
			console.log(error.response);
		}
	}
}

module.exports = CloudFlare;

if (require.main === module) {
	(async function () {
		//write a for loop that runs through my subdomains?
		try {
			//chatgpt code ....
			const domainValues = Object.values(config.domains)
				.filter((obj) => typeof obj === "object" && obj.domain)
				.map((obj) => obj.domain);

			//for each domain name in my base.js file.
			for (let domainName of domainValues) {
				//write a logic to compare ip for domain in the loop
				let cloudflare = new CloudFlare(config);
				cloudflare.compareIP(domainName);
				// cloudflare.getAllDNS("memos")
			}
		} catch (error) {
			console.log("IIFE Error:", error);
		}
	})();
}

// To get DNS RECORD ID.
// async getAllDNS(){

//     try {
//         const options = {
//         method: 'GET',
//         url: `${this.baseUrl}${this.zoneId}/dns_records`,
//         headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': "Bearer " + this.apiToken
//             }
//         };
//         let cfRes = await axios.request(options)
//         console.log(cfRes.data.result)

//     } catch (error) {
//         console.log(error.response); // this is the main part. Use the response property from the error object
//     }

// }

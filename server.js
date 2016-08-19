'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

var data_post = []


var data_send = {
    "title": "",
    "category": null,
    "street": "",
    "town": "",
    "extra_location": "",
    "user": 25,
    "description": ""
}


// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/tarant/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/tarant/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
      var res_sp = text.split(":");
      if (res_sp.length > 1){
        if (res_sp[0] == 'Titulo') {
          data_send.title = res_sp[1]
        }
        if (res_sp[0] == 'Calle') {
          data_send.street = res_sp[1]
        }
        if (res_sp[0] == 'Colonia') {
          data_send.town = res_sp[1]
        }
        if (res_sp[0] == 'Extra') {
          data_send.extra_location = res_sp[1]
        }
        if (res_sp[0] == 'Descripción') {
          data_send.description = res_sp[1]
        }
      }else{
        if (text === 'Generic') {
          sendGenericMessage(sender)
          continue
        }
        if (text === "Ubicación") {
          locationMP(sender)
          continue
        }
        if (text === "Contacto") {
          dataMessage(sender)
          continue
        }
        if (text === "Recientes") {
          dataPosts(sender)
          continue
        }
        if (text === "Prevención") {
          sendImages(sender)
          continue
        }
        if (text === "Reportar") {
          selectCategory(sender)
          continue
        }
      }

			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text2 = JSON.stringify(event.postback)
      var text3 = String(event.postback.payload)
      sendTextMessage(sender, "Postback received: "+text2.substring(0, 200), token)
      if (text3 == "Experiencias") {
        data_send.category = 1
        console.log("ex");
        getTitlePost(sender)
      }else if (text3 == "Robos") {
        console.log("ro");
        data_send.category = 2
        getTitlePost(sender)
      }else if (text3 == "Alerta") {
        console.log("lae");
        data_send.category = 3
        getTitlePost(sender)
      }else if (text3 == "Titulo") {
        console.log("title");
        getStreetPost(sender)
      }else if (text3 == "Calle"){
        getTownPost(sender)
      }else if (text3 == "Colonia"){
        getExtraPost(sender)
      }else if (text3 == "Extra"){
        getDescriptionPost(sender)
      }
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAAEjs8BATfMBALuTVc7oJWhInDmvecV02p0TFaOK03GvyBaJ0tJScDFjWJ33o9ErNuGlPlNOGn4xKqdBy8PQpzEvsj5n3u9aGzR8HInTtdlSrPxCbi4EwOpMu3SZBJHGqaQtpuc5MHHNsZBFEPY2ilI1fVSdnWSz3zsIcBngZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function locationMP(sender){
  let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": {
                    "element": {
                        "title": "Ubicación del MP mas cercano",
                        "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="+"20.1029126"+","+"-98.3558106"+"&zoom=25&markers="+"20.1029126"+","+"-98.3558106",
                        "item_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="+"20.1029126"+","+"-98.3558106"+"&zoom=25&markers="+"20.1029126"+","+"-98.3558106"
                    }
                }
            }
        }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function dataMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Teléfonos de Contacto",
					"subtitle": "- 775 75 3 01 57 EXT. 4133 y 4633" +
          " - 775 75 5 26 86 " +
          " - 01 800 69 0 74 48",
					"image_url": "http://premiumwebfreebies.com/wp-content/uploads/2013/11/flat-email-icon-display.jpg",

				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function dataPosts(sender) {
  request("http://40.118.210.129:8080/restrobos/posts/", function(error, response, body) {
    var data = JSON.parse(body)
    var results = data.results
    for (var i = 0; i < 5; i++) {
      var elements = {
        "title": results[i].title,
        "subtitle": "Calle: " + results[i].street + " Colonia: " + results[i].town,
        "image_url": "http://flatdesign.im/gallerys/web/20/yellow-warning-sign-preview.png",
      }
      data_post.push(elements)
    }
    console.log(data_post);
  });
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": data_post
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendImages(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Marca 01",
					"subtitle": "ABREN CON CADENA",
					"image_url": "images/abren_con_cadena.png",
				}, {
					"title": "Marca 02",
					"subtitle": "AQUI NADA",
					"image_url": "images/aqui_nada.png",
				}, {
					"title": "Marca 03",
					"subtitle": "CASA CARITATIVA",
					"image_url": "images/casa_caritativa.png",
				}, {
					"title": "Marca 04",
					"subtitle": "CASA DE EMPRESARIO",
					"image_url": "images/casa_de_empresario.png",
				}, {
					"title": "Marca 05",
					"subtitle": "CASA DESHABITADA",
					"image_url": "images/casa_deshabitada.png",
				}, {
					"title": "Marca 06",
					"subtitle": "CASA YA ROBADA",
					"image_url": "images/casa_ya_robada.png",
				}, {
					"title": "Marca 07",
					"subtitle": "CUIDADO POLICIA",
					"image_url": "images/cuidado_policia.png",
				}, {
					"title": "Marca 08",
					"subtitle": "DE VACACIONES",
					"image_url": "images/de_vacaciones.png",
				}, {
					"title": "Marca 09",
					"subtitle": "DISPUESTA PARA ROBAR",
					"image_url": "images/dispuesta_para_robar.png",
				}, {
					"title": "Marca 10",
					"subtitle": "ESTAN FUERA PERO HAY DIFICULTADES",
					"image_url": "images/estan_fuera_pero_hay_dificultades.png",
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function selectCategory(sender) {

  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Selecciona una categoria",
        "buttons":[
          {
            "type":"postback",
            "title":"Experiencias",
            "payload":"Experiencias"
          },
          {
            "type":"postback",
            "title":"Robos",
            "payload":"Robos"
          },
          {
            "type":"postback",
            "title":"Alerta",
            "payload":"Alerta"
          }
        ]
      }
    }
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})


  //request({
  //  uri: "http://40.118.210.129:8080/restrobos/posts/",
  //  method: "POST",
  //  form: data_send
  //}, function(error, response, body) {
    //console.log(body);
  //});


}

function getTitlePost(sender) {
	let messageData = {
    "attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Ingresa el Titulo Con El Siguiente Formato",
					"subtitle": "Titulo:TuTitulo",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Titulo",
					}],
				}]
			}
		}
  }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function getStreetPost(sender) {
	let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Ingresa la Calle Con El Siguiente Formato",
          "subtitle": "Calle:TuCalle",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Calle",
          }],
        }]
      }
    }
  }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function getTownPost(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Ingresa la Colonia Con El Siguiente Formato",
          "subtitle": "Colonia:TuColonia",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Colonia",
          }],
        }]
      }
    }
  }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function getExtraPost(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Ingresa los Datos Extra de La Ubicación Con El Siguiente Formato",
          "subtitle": "Extra:DetallesExtra",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Extra",
          }],
        }]
      }
    }
  }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function getDescriptionPost(sender) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Ingresa la Descripción Con El Siguiente Formato",
          "subtitle": "Descripción:TuDescripción",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Descripcion",
          }],
        }]
      }
    }
  }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

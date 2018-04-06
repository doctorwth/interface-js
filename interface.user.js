// ==UserScript==
// @name        [s4s] interface
// @namespace   s4s4s4s4s4s4s4s4s4s
// @version     2.0
// @author      le fun css man AKA Doctor Worse Than Hitler, kekero
// @email       doctorworsethanhitler@gmail.com
// @description Lets you view the greenposts.
// @match       https://boards.4chan.org/s4s/thread/*
// @match       http://boards.4chan.org/s4s/thread/*
// @connect     funposting.online
// @run-at      document-start
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlHttpRequest
// @icon data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZD0iTTAgMEgxNlYxNkgwIiBmaWxsPSIjZGZkIi8+PHBhdGggZD0iTTMgNCA2IDFoNGwzIDN2OGwtMyAzSDZMMyAxMiIgZmlsbD0iZ3JlZW4iLz48cGF0aCBkPSJtNS41IDExLjVoLTJ2LTdoMnYtM2MtMyAwLTUgMi41LTUgNi41IDAgNCAyIDYuNSA1IDYuNXptNSAzYzMgMCA1LTIuNSA1LTYuNSAwLTQtMi02LjUtNS02LjV2M2gydjdoLTJ6bS00LTRoM0wxMCAyLjVINlptMCAzaDN2LTNoLTN6IiBmaWxsPSIjZmZmIiBzdHJva2U9ImdyZWVuIi8+PC9zdmc+
// ==/UserScript==

if(query("#s4sinterface-css")){
	throw "Multiple instances of [s4s] interface detected"
}

var threadId=location.pathname.match(/\/thread\/(\d+)/)[1]
var weekdays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
var postFormClassic
var postFormQR
var postFormQRX
var showRealQR

if(typeof GM=="undefined"){
	window.GM={
		xmlHttpRequest:window.GM_xmlhttpRequest
	}
}

// Request green posts
var serverurl="https://funposting.online/interface/"
GM.xmlHttpRequest({
	method:"get",
	url:serverurl+"get.php?thread="+threadId,
	onload:response=>{
		if(response.status==200){
			onPageLoad(_=>{
				var postsObj=JSON.parse(response.responseText)
				var postsCount=Object.keys(postsObj).length
				if(postsCount){
					threadingX(_=>{
						for(var i=0;i<postsCount;i++){
							addPost(postsObj[i])
						}
					})
				}
			})
		}
	}
})

onPageLoad(_=>{
	// Classic post form
	var nameField=query("#postForm input[name=name]")
	if(nameField){
		var greenToggle=element(
			["button#toggle",{
				class:"greenToggle",
				title:"[s4s] Interface",
				onclick:event=>{
					event.preventDefault()
					event.stopPropagation()
					showPostFormClassic()
				}
			},"!"]
		).toggle
		var nameParent=nameField.parentNode
		nameParent.classList.add("nameFieldParent")
		nameParent.insertBefore(greenToggle,nameField)
	}else{
		showPostFormClassic()
	}
})

// Native extension QR
document.addEventListener("QRNativeDialogCreation",onQRCreated)
if(unsafeWindow.Main){
	onNativeextInit()
}else{
	document.addEventListener("4chanMainInit",onNativeextInit)
}

// 4chan-X QR integration
document.addEventListener("QRDialogCreation",onQRXCreated)

function onPageLoad(func){
	if(document.readyState=="loading"){
		addEventListener("DOMContentLoaded",func)
	}else{
		func()
	}
}

// Add a post to the proper position in the thread
function addPost(aPost){
	var numberless=aPost.options=="numberless"
	var afterNo=numberless?"XXXXXX":aPost.after_no
	var postId=afterNo+"-"+aPost.id
	var date=new Date(aPost.timestamp*1000)
	var dateString=
		padding(date.getDate(),2)+"/"+
		padding(date.getMonth()+1,2)+"/"+
		(""+date.getFullYear()).slice(-2)+
		"("+weekdays[date.getDay()]+")"+
		padding(date.getHours(),2)+":"+
		padding(date.getMinutes(),2)+":"+
		padding(date.getSeconds(),2)
	var linkReply
	if(!numberless){
		linkReply=[0,
			" ",
			["a",{
				href:"#p"+postId,
				title:"Link to this post"
			},"No."],
			["a",{
				href:"javascript:quote('"+postId+"');",
				title:"Reply to this post"
			},postId]
		]
	}
	var post=element(
		["div#post",{
			class:"postContainer replyContainer greenPostContainer",
			id:"pc"+aPost.after_no
		},
			["div",{
				class:"sideArrows",
				id:"sa"+postId
			},">>"],
			["div",{
				class:"post reply",
				id:"p"+postId
			},
				["div",{
					class:"postInfoM mobile",
					id:"pim"+postId
				},
					["span",{
						class:"nameBlock"
					},
						["span",{
							class:"name"
						},aPost.username],
						["br"]
					],
					["span",{
						class:"dateTime postNum",
						"data-utc":aPost.timestamp
					},
						dateString,
						linkReply
					]
				],
				["div",{
					class:"postInfo desktop",
					id:"pi"+postId
				},
					["input",{
						type:"checkbox",
						name:"ignore",
						value:"delete"
					}],
					["span",{
						class:"nameBlock"
					},
						["span",{
							class:"name"
						},aPost.username]
					],
					" ",
					["span",{
						class:"dateTime",
						"data-utc":aPost.timestamp
					},dateString],
					(!numberless&&
						["span",{
							class:"postNum desktop"
						},linkReply]
					)
				],
				["blockquote",{
					class:"postMessage",
					id:"m"+postId,
					innerHTML:aPost.text
				}]
			]
		]
	).post
	// Add the post
	var afterPost=query("#pc"+aPost.after_no)
	if(afterPost){
		insertAfter(post,afterPost)
	}else{
		// Parent post is deleted
		var currentPost=query(".thread>.postContainer:last-of-type")
		while(1){
			var prevPost=currentPost.previousSibling
			if(!prevPost||prevPost.id.split("pc")[1]<aPost.after_no){
				break
			}
			currentPost=prevPost
		}
		currentPost.parentNode.insertBefore(post,currentPost)
	}
	return
}

// Classic post form
function showPostFormClassic(hide){
	var formSelector="body>form:not(.greenPostForm)"
	var nameField=query(formSelector+" input[name=name]")
	var optionsField=query(formSelector+" input[name=email]")
	var commentField=query(formSelector+" textarea")
	if(hide){
		if(postFormClassic){
			if(nameField){
				nameField.value=postFormClassic.name.value
				optionsField.value=postFormClassic.options.value
				commentField.value=postFormClassic.comment.value
			}
			postFormClassic.form.parentNode.removeChild(postFormClassic.form)
			postFormClassic=0
		}
		return
	}
	if(postFormClassic){
		return
	}
	var username=""
	if(nameField){
		username=nameField.value
	}else{
		var nameMatch=document.cookie.match(/4chan_name=(.*?)(?:;|$)/)
		if(nameMatch){
			username=nameMatch[1]
		}
	}
	postFormClassic=element(
		["form#form",{
			name:"post",
			action:serverurl+"post.php",
			method:"post",
			enctype:"multipart/form-data",
			class:"greenPostForm"
		},
			["table",{
				class:"postForm"
			},
				["tbody",
				["tr",
					["td","Name"],
					["td",{
						class:"nameFieldParent"
					},
						(nameField&&
							["button#toggle",{
								class:"greenToggle pressed",
								title:"[s4s] Interface",
								onclick:event=>{
									event.preventDefault()
									event.stopPropagation()
									showPostFormClassic(1)
								}
							},"!"]
						),
						["input#name",{
							type:"text",
							name:"username",
							tabIndex:1,
							placeholder:"Anonymous",
							value:username
						}]
					]
				],
				["tr",
					["td","Options"],
					["td",
						["input#options",{
							type:"text",
							name:"options",
							tabIndex:2,
							value:optionsField?optionsField.value:""
						}],
						["input",{
							type:"submit",
							tabIndex:6,
							value:"Post"
						}]
					]
				],
				["tr",
					["td","Comment"],
					["td",
						["textarea#comment",{
							name:"text",
							tabindex:4,
							cols:48,
							rows:4,
							wrap:"soft",
							value:commentField?commentField.value:""
						}]
					]
				]
				]
			]
		]
	)
	var postForm=query("#postForm")
	if(postForm){
		postForm=postForm.parentNode
	}else{
		postForm=query("body>.closed+*")
		if(!postForm){
			postForm=query("#op")
		}
	}
	postForm.parentNode.insertBefore(postFormClassic.form,postForm)
}

// Native extension quick reply
function onNativeextInit(){
	showRealQR=unsafeWindow.QR.show
	var newQRshow=function(){
		var event=document.createEvent("Event")
		event.initEvent("QRNativeDialogCreation",false,false)
		document.dispatchEvent(event)
	}
	if(typeof exportFunction=="function"){
		newQRshow=exportFunction(newQRshow,document.defaultView)
	}
	unsafeWindow.QR.show=newQRshow
}

function onQRCreated(){
	try{
		showRealQR(threadId)
	}catch(e){}
	var formSelector="#qrForm"
	var nameField=query(formSelector+" input[name=name]")
	nameField.tabIndex=0
	var oldToggle=query("#quickReply .greenToggle")
	if(oldToggle){
		oldToggle.parentNode.removeChild(oldToggle)
	}
	var toggle=element(
		["button#toggle",{
			type:"button",
			class:"greenToggle",
			title:"[s4s] Interface",
			onclick:event=>{
				event.preventDefault()
				event.stopPropagation()
				showPostFormQR()
			}
		},"!"]
	).toggle
	var nameParent=nameField.parentNode
	nameParent.classList.add("nameFieldParent")
	nameParent.insertBefore(toggle,nameField)
}

function showPostFormQR(hide){
	var formSelector="#qrForm"
	var nameField=query(formSelector+" input[name=name]")
	var optionsField=query(formSelector+" input[name=email]")
	var commentField=query(formSelector+" textarea")
	if(hide){
		if(postFormQR){
			nameField.value=postFormQR.name.value
			optionsField.value=postFormQR.options.value
			commentField.value=postFormQR.comment.value
			postFormQR.form.parentNode.removeChild(postFormQR.form)
			postFormQR=0
		}
		return
	}
	var qr=query("#quickReply form:not(.greenPostForm)")
	if(postFormQR||!qr){
		return
	}
	postFormQR=element(
		["form#form",{
			name:"post",
			action:serverurl+"post.php",
			method:"post",
			enctype:"multipart/form-data",
			class:"greenPostForm"
		},
			["input",{
				name:"thread",
				value:threadId,
				type:"hidden"
			}],
			["div",{
				class:"nameFieldParent"
			},
				["button",{
					type:"button",
					class:"greenToggle pressed",
					title:"[s4s] Interface",
					onclick:event=>{
						showPostFormQR(1)
					}
				},"!"],
				["input#name",{
					type:"text",
					name:"username",
					class:"field",
					placeholder:"Anonymous",
					value:nameField.value
				}]
			],
			["div",
				["input#options",{
					type:"text",
					name:"options",
					class:"field",
					placeholder:"Options",
					value:optionsField.value
				}]
			],
			["div",
				["textarea#comment",{
					name:"text",
					class:"field",
					cols:48,
					rows:4,
					wrap:"soft",
					placeholder:"Comment",
					value:commentField.value
				}],
			],
			["div",
				["input",{
					type:"submit",
					value:"Post"
				}]
			]
		]
	)
	qr.parentNode.insertBefore(postFormQR.form,qr)
}

// 4chan-X QR
function onQRXCreated(){
	var qrPersona=query("#qr .persona")
	if(!qrPersona){
		return
	}
	var toggle=element(
		["button#toggle",{
			type:"button",
			class:"greenToggle",
			title:"[s4s] Interface",
			onclick:event=>{
				event.preventDefault()
				event.stopPropagation()
				showPostFormQRX()
			}
		},"!"]
	).toggle
	qrPersona.insertBefore(toggle,qrPersona.firstChild)
}

function showPostFormQRX(hide){
	var formSelector="#qr form:not(.greenPostForm)"
	var nameField=query(formSelector+" input[name=name]")
	var optionsField=query(formSelector+" input[name=email]")
	var commentField=query(formSelector+" textarea")
	if(hide){
		if(postFormQRX){
			nameField.value=postFormQRX.name.value
			optionsField.value=postFormQRX.options.value
			commentField.value=postFormQRX.comment.value
			postFormQRX.form.parentNode.removeChild(postFormQRX.form)
			postFormQRX=0
		}
		return
	}
	var qrx=query("#qr>form")
	if(postFormQRX||!qrx){
		return
	}
	postFormQRX=element(
		["form#form",{
			name:"post",
			action:serverurl+"post.php",
			method:"post",
			enctype:"multipart/form-data",
			class:"greenPostForm"
		},
			["input",{
				name:"thread",
				value:threadId,
				type:"hidden"
			}],
			["div",{
				class:"persona"
			},
				["button",{
					type:"button",
					class:"greenToggle pressed",
					title:"[s4s] Interface",
					onclick:event=>{
						showPostFormQRX(1)
					}
				},"!"],
				["input#name",{
					name:"username",
					class:"field",
					placeholder:"Name",
					size:1,
					value:nameField.value
				}],
				["input#options",{
					name:"options",
					class:"field",
					placeholder:"Options",
					size:1,
					value:optionsField.value
				}]
			],
			["textarea#comment",{
				name:"text",
				class:"field",
				placeholder:"Comment",
				value:commentField.value
			}],
			["div",{
				class:"file-n-submit"
			},
				["input",{
					type:"submit",
					value:"Submit"
				}]
			]
		]
	)
	qrx.parentNode.insertBefore(postFormQRX.form,qrx)
}

// Disable 4chan-X threading when inserting posts
function threadingX(func){
	if(
		document.documentElement.classList.contains("fourchan-x","thread-view")
		&&query(".threadContainer")
	){
		var menuButton=query("#shortcut-menu>.menu-button")
		if(!menuButton){
			return func()
		}
		menuButton.click()
		var threadingCheckbox=query("#threadingControl")
		if(!threadingCheckbox){
			menuButton.click()
			return func()
		}
		threadingCheckbox.click()
		func()
		threadingCheckbox.click()
		menuButton.click()
	}else{
		func()
	}
}

// Stylesheet
var stylesheet=`
.greenPostForm+form .postForm>tbody>tr:not(.rules),
#quickReply .greenPostForm+form,
#qr .greenPostForm+form{
	display:none!important;
}
.greenPostForm .file-n-submit{
	display:flex;
	align-items:stretch;
	justify-content:flex-end;
	height:25px;
	margin-top:1px;
}
.greenPostForm .file-n-submit input{
	width:25%;
	background:linear-gradient(to bottom,#f8f8f8,#dcdcdc) no-repeat;
	border:1px solid #bbb;
	border-radius:2px;
	height:100%;
}
.greenPostContainer .post.reply{
	background-color:#dfd!important;
	border:2px solid #008000!important;
}
.greenPostContainer .postMessage{
	color:#000!important;
}
.greenToggle{
	font-family:monospace;
	font-size:16px;
	line-height:17px;
	background:#ceb!important;
	width:24px;
	padding:0;
	border:1px solid #bbb;
}
.greenPostForm input:not([type=submit]),
.greenPostForm textarea{
	background-color:#dfd;
	color:#000;
}
.greenToggle.pressed{
	background:#6d6!important;
	font-weight:bold;
	color:#fff;
}
.postForm .greenToggle+input{
	width:220px!important;
}
.postForm .nameFieldParent,
#quickReply .nameFieldParent{
	display:flex;
	flex-direction:row;
}
.postForm textarea{
	width:292px;
}
#quickReply .greenToggle{
	width:23px;
	height:23px;
}
#quickReply .greenToggle+input{
	width:273px!important;
}
@media only screen and (max-width:480px){
	.postForm .greenToggle+input{
		width:196px!important;
	}
	.postForm input[type="submit"]{
		width:60px;
		padding:2px 4px 3px;
		margin:0;
	}
	.postForm:not(.hideMobile){
		margin-top:20px;
	}
}
`.replace(/\n\s*/g,"")
element(
	document.head||document.documentElement,
	["style",{
		id:"s4sinterface-css"
	},stylesheet]
)

function query(selector){
	return document.querySelector(selector)
}

function padding(string,num){
	return (""+string).padStart(num,0)
}

function insertAfter(newElement,targetElement){
	var parentNode=targetElement.parentNode
	var nextSibling=targetElement.nextSibling
	if(nextSibling){
		parentNode.insertBefore(newElement,nextSibling)
	}else{
		parentNode.appendChild(newElement)
	}
}

function element(){
	var parent
	var lasttag
	var createdtag
	var toreturn={}
	for(var i=0;i<arguments.length;i++){
		var current=arguments[i]
		if(current){
			if(current.nodeType){
				parent=lasttag=current
			}else if(Array.isArray(current)){
				for(var j=0;j<current.length;j++){
					if(current[j]){
						if(!j&&typeof current[j]=="string"){
							var tagname=current[0].split("#")
							lasttag=createdtag=document.createElement(tagname[0])
							if(tagname[1]){
								toreturn[tagname[1]]=createdtag
							}
						}else if(current[j].constructor==Object){
							if(lasttag){
								for(var value in current[j]){
									if(value!="style"&&value in lasttag){
										lasttag[value]=current[j][value]
									}else{
										lasttag.setAttribute(value,current[j][value])
									}
								}
							}
						}else{
							var returned=element(lasttag,current[j])
							for(var k in returned){
								toreturn[k]=returned[k]
							}
						}
					}
				}
			}else if(current){
				createdtag=document.createTextNode(current)
			}
			if(parent&&createdtag){
				parent.appendChild(createdtag)
			}
			createdtag=0
		}
	}
	return toreturn
}

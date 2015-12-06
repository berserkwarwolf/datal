var XMLManager = Backbone.Model.extend({
    createXMLDocument: function (rootElementName, namespaceURI, documentType) {

        var xmlDocument = null;
        namespaceURI = namespaceURI || '';
        documentType = documentType || null;

        if (document.implementation && document.implementation.createDocument) {
            xmlDocument = document.implementation.createDocument(namespaceURI, rootElementName, documentType);
        }
        else if (typeof ActiveXObject != 'undefined') {
        /*@cc_on @*/
        /*@if (@_jscript_version >= 5)
	        try {
	            xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
	            var rootElement = xmlDocument.createNode(1, rootElementName, namespaceURI);
	            xmlDocument.appendChild(rootElement);
	        }
	        catch (e) { }
	        @end @*/
        }

        return xmlDocument;
    },
    createElementNS: function (namespaceURI, elementName, ownerDocument) {
        var element = null;
        if (typeof ownerDocument.createElementNS != 'undefined') {
            element = ownerDocument.createElementNS(namespaceURI, elementName);
        }
        else if (typeof ownerDocument.createNode != 'undefined') {
            element = ownerDocument.createNode(1, elementName, namespaceURI);
        }

        return element;
    },
    setAttributeNodeNS: function (element, attributeName, attributeValue, namespaceURI) {
        if (typeof element.setAttributeNS != 'undefined') {
            element.setAttributeNS(namespaceURI, attributeName, attributeValue);
        }
        else if (typeof element.ownerDocument != 'undefined' &&
            typeof element.ownerDocument.createNode != 'undefined') {
            var attribute = element.ownerDocument.createNode(2, attributeName, namespaceURI);
            attribute.nodeValue = attributeValue;
            element.setAttributeNode(attribute);
        }
    },
    serializeNode: function (node) {
        if (typeof XMLSerializer != 'undefined') {
            return new XMLSerializer().serializeToString(node);
        }
        else if (typeof node.xml != 'undefined') {
            return node.xml;
        }
        else {
            return '';
        }
    }
});
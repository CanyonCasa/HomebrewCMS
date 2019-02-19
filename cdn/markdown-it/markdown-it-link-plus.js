/*! markdown-it-link-plus 1.0.0 @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitLinkPlus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

'use strict';

function chgLink(token, env, callback) {
  // external user function callback (can override internal function)...
  if (typeof callback === 'function') return callback(token,env); 
  // internal function to process special links...
  token.attrs.forEach(function(a){ 
    if (a[0]==='href') {
      switch (a[1].charAt(0)) {
        case ":": a[1] = 'javascript'+a[1]+';void(0);'; break;
        case "@": token.attrs.push(['onclick',a[1].slice(1)]); a[1] = "#"; break; 
        case "*": a[1] = a[1].slice(1); token.attrs.push(['target','_blank']); break; 
      };
    }; 
  });
};

module.exports = function (md) {
    md.core.ruler.after(
        'inline',
        'link-plus',
        function (state) {
            var callback = md.options.linkPlus;
            state.tokens.forEach(function (blockToken) {
                if (blockToken.type === 'inline' && blockToken.children) {
                    blockToken.children.forEach(function (token) {
                        if (token.type === 'link_open') chgLink(token,state.env,callback);
                    }); 
                }
            }); 
            return false;
        }
    );
};
},{}]},{},[1])(1)
});

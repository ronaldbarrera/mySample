package com.fisa.render.limit.core;

import java.util.List;

public class LimitView {
	private String codePackage;
	private String namePackage;
	private String aplicaA;
	List<CustomLevel> custonLevel;
	
	public String getCodePackage() {
		return codePackage;
	}
	public void setCodePackage(String codePackage) {
		this.codePackage = codePackage;
	}
	public String getNamePackage() {
		return namePackage;
	}
	public void setNamePackage(String namePackage) {
		this.namePackage = namePackage;
	}
	public List<CustomLevel> getCustonLevel() {
		return custonLevel;
	}
	public void setCustonLevel(List<CustomLevel> custonLevel) {
		this.custonLevel = custonLevel;
	}
	public String getAplicaA() {
		return aplicaA;
	}
	public void setAplicaA(String aplicaA) {
		this.aplicaA = aplicaA;
	}
	
}

package com.fisa.render.limit.core;

import java.math.BigDecimal;
import java.util.List;

public class LimitView {
	private String codePackage;
	private String namePackage;
	private String aplicaA;
	List<CustomLevel> custonLevel;
	private String codeLimit;
	private String nameLimit;
	private String moneda;
	private BigDecimal cupoMaximo;
	private BigDecimal cupoDefecto;
	
	
	
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
	public String getCodeLimit() {
		return codeLimit;
	}
	public void setCodeLimit(String codeLimit) {
		this.codeLimit = codeLimit;
	}
	public String getNameLimit() {
		return nameLimit;
	}
	public void setNameLimit(String nameLimit) {
		this.nameLimit = nameLimit;
	}
	public String getMoneda() {
		return moneda;
	}
	public void setMoneda(String moneda) {
		this.moneda = moneda;
	}
	public BigDecimal getCupoMaximo() {
		return cupoMaximo;
	}
	public void setCupoMaximo(BigDecimal cupoMaximo) {
		this.cupoMaximo = cupoMaximo;
	}
	public BigDecimal getCupoDefecto() {
		return cupoDefecto;
	}
	public void setCupoDefecto(BigDecimal cupoDefecto) {
		this.cupoDefecto = cupoDefecto;
	}
	
}

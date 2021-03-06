package com.fisa.render.limit.model;

import java.math.BigDecimal;
import java.util.List;

public class LimitView {
	private String codePackage;
	private String codeLimit;
	private String nameLimit;
	private String moneda;
	private BigDecimal cupoMaximo;
	private BigDecimal cupoDefecto;
	
	
	private boolean  deleted=false;
	private boolean  updated=false;
	
	public String getCodePackage() {
		return codePackage;
	}
	public void setCodePackage(String codePackage) {
		this.codePackage = codePackage;
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
	public boolean isDeleted() {
		return deleted;
	}
	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}
	public boolean isUpdated() {
		return updated;
	}
	public void setUpdated(boolean updated) {
		this.updated = updated;
	}

	

	
}

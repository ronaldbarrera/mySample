package com.fisa.render.quota.view.model;

import java.math.BigDecimal;
import java.util.Date;

public class QuotaData {

	//para identificar el Grupo
	private String group_code;
	
	private String quota;
	private String currency;
	private BigDecimal maxQuota;
	private double defaultQuota;
	private int    maxNumTransac;
	private int    defaultNumTransac;
	private Date   starDate;
	private Date   validityTo; //VigenciaHasta;
	public String getGroup_code() {
		return group_code;
	}
	public void setGroup_code(String group_code) {
		this.group_code = group_code;
	}
	public String getQuota() {
		return quota;
	}
	public void setQuota(String quota) {
		this.quota = quota;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
	public BigDecimal getMaxQuota() {
		return maxQuota;
	}
	public void setMaxQuota(BigDecimal maxQuota) {
		this.maxQuota = maxQuota;
	}
	public double getDefaultQuota() {
		return defaultQuota;
	}
	public void setDefaultQuota(double defaultQuota) {
		this.defaultQuota = defaultQuota;
	}
	public int getMaxNumTransac() {
		return maxNumTransac;
	}
	public void setMaxNumTransac(int maxNumTransac) {
		this.maxNumTransac = maxNumTransac;
	}
	public int getDefaultNumTransac() {
		return defaultNumTransac;
	}
	public void setDefaultNumTransac(int defaultNumTransac) {
		this.defaultNumTransac = defaultNumTransac;
	}
	public Date getStarDate() {
		return starDate;
	}
	public void setStarDate(Date starDate) {
		this.starDate = starDate;
	}
	public Date getValidityTo() {
		return validityTo;
	}
	public void setValidityTo(Date validityTo) {
		this.validityTo = validityTo;
	}
	
	
	

	
	
}

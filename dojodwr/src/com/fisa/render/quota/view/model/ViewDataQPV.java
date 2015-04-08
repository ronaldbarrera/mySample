package com.fisa.render.quota.view.model;
/**
 * 
 * @author ronaldbarrera
 *
 */
public class ViewDataQPV {
	
	private String codePackage;
	private String namePackage;
	private String applyTo;
	
	//transaccion / subtransacciones
	private GroupT[] groups;
	
	private QuotaData[] quotaDataList;

	public QuotaData[] getQuotaDataList() {
		return quotaDataList;
	}

	public void setQuotaDataList(QuotaData[] quotaDataList) {
		this.quotaDataList = quotaDataList;
	}
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
	public String getApplyTo() {
		return applyTo;
	}
	public void setApplyTo(String applyTo) {
		this.applyTo = applyTo;
	}
	
	public GroupT[] getGroups() {
		return groups;
	}

	public void setGroups(GroupT[] groups) {
		this.groups = groups;
	}

	@Override
	public String toString() {
		return "ViewDataQPV [codePackage=" + codePackage + ", namePackage="
				+ namePackage + ", applyTo=" + applyTo + "]";
	}
	
}

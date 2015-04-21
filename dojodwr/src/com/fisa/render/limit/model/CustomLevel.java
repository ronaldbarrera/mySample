package com.fisa.render.limit.model;

import java.util.List;

public class CustomLevel {
	private String name;
	private String code;
	private List<CustomLevel> personaliLevel;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public List<CustomLevel> getPersonaliLevel() {
		return personaliLevel;
	}
	public void setPersonaliLevel(List<CustomLevel> personaliLevel) {
		this.personaliLevel = personaliLevel;
	}
	
}

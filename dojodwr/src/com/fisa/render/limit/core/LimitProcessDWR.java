package com.fisa.render.limit.core;


public class LimitProcessDWR{
	 
	
	
	public String hiFisa(String name)
    {
        return "Hello Fisa, by " + name;
    }
	
	public LimitView getViewData(String modo, String packageCode){
		return Samples.getData();
	}
}

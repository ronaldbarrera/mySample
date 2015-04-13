package com.fisa.render.limit.dwr;

import java.util.List;

import com.fisa.render.limit.model.LimitView;
import com.fisa.render.quota.view.demo.Samples;


public class LimitProcessDWR{
	 
	
	
	public String hiFisa(String name)
    {
        return "Hello Fisa, by " + name;
    }

	public List<LimitView> getViewData2(String name){
		return Samples.getData2();
	}
}

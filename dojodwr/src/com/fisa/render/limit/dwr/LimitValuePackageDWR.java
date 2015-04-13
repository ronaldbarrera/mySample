package com.fisa.render.limit.dwr;

import java.util.List;

import com.fisa.render.limit.model.LimitView;
import com.fisa.render.quota.view.demo.Samples;


public class LimitValuePackageDWR{
	 
	public String hiFisa(String name){
        return "Hello Fisa Package, by " + name;
    }

	public List<LimitView> getViewData(String name){
		return Samples.getData2();
	}
}

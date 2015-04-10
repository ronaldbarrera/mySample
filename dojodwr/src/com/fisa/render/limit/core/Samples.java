package com.fisa.render.limit.core;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

public class Samples {

	public static LimitView getData(){		
		LimitView lv =new LimitView();
		lv.setCodePackage(""+Samples.randBetween(1, 185));
		lv.setNamePackage("Paquete de Limites y Transacciones");
		lv.setAplicaA("Empresas");
		List<CustomLevel> lc = new ArrayList<CustomLevel>();
		CustomLevel cl = new CustomLevel();
		String txt1 = Samples.randText(randBetween(20, 333));
		cl.setCode(txt1);
		cl.setName(txt1);
		lc.add(cl);
		CustomLevel cl2 = new CustomLevel();
		String txt2 = Samples.randText(randBetween(20, 333));
		cl2.setCode(txt2);
		cl2.setName(txt2);
		lc.add(cl2);
		CustomLevel cl3 = new CustomLevel();
		String txt3 = Samples.randText(randBetween(20, 333));
		cl3.setCode(txt3);
		cl3.setName(txt3);
		lc.add(cl3);
		lv.setCustonLevel(lc);
		return lv;
	}
	
	public static List<LimitView> getData2(){
		List<LimitView> lista = new ArrayList<LimitView>();
		
		LimitView lv =new LimitView();
		lv.setCodePackage(""+Samples.randBetween(1, 185));
		lv.setNamePackage("Paquete de Limites y Transacciones");
		lv.setAplicaA("Empresas");
		List<CustomLevel> lc = new ArrayList<CustomLevel>();
		CustomLevel cl = new CustomLevel();
		String txt1 = Samples.randText(randBetween(20, 333));
		cl.setCode(txt1);
		cl.setName(txt1);
		lc.add(cl);
		CustomLevel cl2 = new CustomLevel();
		String txt2 = Samples.randText(randBetween(20, 333));
		cl2.setCode(txt2);
		cl2.setName(txt2);
		lc.add(cl2);
		CustomLevel cl3 = new CustomLevel();
		String txt3 = Samples.randText(randBetween(20, 333));
		cl3.setCode(txt3);
		cl3.setName(txt3);
		lc.add(cl3);
		lv.setCustonLevel(lc);
		lv.setCodeLimit("01");
		lv.setNameLimit("Limite Diaro");
		lv.setCupoMaximo(new BigDecimal("1000"));
		lv.setCupoDefecto(new BigDecimal("5255"));
		lista.add(lv);
		
		LimitView lv2 =new LimitView();
		lv2.setCodePackage(""+Samples.randBetween(1, 185));
		lv2.setNamePackage("Paquete de Limites y Transacciones 2");
		lv2.setAplicaA("Empresas");
		
		lv2.setCodeLimit("01");
		lv2.setNameLimit("Limite Semanal");
		lv2.setCupoMaximo(new BigDecimal("1000"));
		lv2.setCupoDefecto(new BigDecimal("5255"));
		lista.add(lv2);
		
		LimitView lv3 =new LimitView();
		lv3.setCodePackage(""+Samples.randBetween(1, 185));
		lv3.setNamePackage("Paquete de Limites y Transacciones 3");
		lv3.setAplicaA("Empresas");
		
		lv3.setCodeLimit("01");
		lv3.setNameLimit("Limite Mensual");
		lv3.setCupoMaximo(new BigDecimal("1000"));
		lv3.setCupoDefecto(new BigDecimal("5255"));
		lista.add(lv3);
		return lista;
		
	}
	
	
	
	public static Date fechaRandom(int maxYear) {
        GregorianCalendar gc = new GregorianCalendar();
        int year = randBetween(2000, maxYear);
        gc.set(gc.YEAR, year);
        int dayOfYear = randBetween(1, gc.getActualMaximum(gc.DAY_OF_YEAR));
        gc.set(gc.DAY_OF_YEAR, dayOfYear);
        System.out.println(gc.get(gc.YEAR) + "-" + gc.get(gc.MONTH) + "-" + gc.get(gc.DAY_OF_MONTH));
        return gc.getTime();
    }

    public static int randBetween(int start, int end) {
        return start + (int)Math.round(Math.random() * (end - start));
    }
    
    public static String randText(int item){
    	while(item>5){
    		item= item-5;
    	}
    	if(item>4){item--;}
    	return Samples.ListaTipos(5).get(item);
    }
    
    public static List<String> ListaTipos(int item){
    	List<String> tipos = new ArrayList<String>(5);
    	tipos.add("Transaccion");
    	tipos.add("Pagos");
    	tipos.add("Primas");
    	tipos.add("Grupos");
    	tipos.add("Deudas");
    	return tipos;
    }
    
	public static void main(String[] args) {
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
		System.out.println(Samples.randText(randBetween(20, 333)));
	}
}
